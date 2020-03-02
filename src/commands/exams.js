const moment = require("moment-timezone");
const examInfo = require("../jsonFiles/exams.json");

module.exports = {
	name: "exams",
	description: "Take either your OWL or NEWT exams.",
	async execute(message, args, bot) {
		const examType = args[0];
		if (!examType || !["owls"].includes(examType)) return message.channel.send(`Incorrect Usage. Proper Usage: \`${bot.prefix}exams [owls/newts]\``);

		// Get the user's data from the db
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		if (examInfo[examType].requiredYear && examInfo[examType].requiredYear != userData.year) return;

		// Valid weeks that users can use this command in
		const validWeeks = [12, 13, 25, 26, 38, 39, 51, 52];
		// Make sure the current week is equal to one of the above weeks
		if (!validWeeks.includes(moment().tz("America/Los_Angeles").week())) return;

		// Amount of spells the user has learned
		const amountOfSpellsLearned = userData.studiedSpells.length;
		const gradeInfo = examInfo[examType].grades;

		// Ask them if they're sure they want to take their exams
		message.channel.send(`**${examType.split("").map(i => i.toUpperCase()).join(".")}**

		__Passing Grades:__
		O - Outstanding (${gradeInfo.O} spells/potions learned)
		E - Exceeds Expectations (${gradeInfo.E} spells/potions learned)
		A - Acceptable (${gradeInfo.A} spells/potions learned)

		__Failing Grades:__
		P - Poor (${gradeInfo.D + 1}-${gradeInfo.P} spells/potions learned)
		D - Dreadful (${gradeInfo.T + 1}-${gradeInfo.D} spells/potions learned)
		T - Troll (0-${gradeInfo.T} spells/potions learned)

**Are you sure you'd like to take your ${examType.split("").map(i => i.toUpperCase()).join(".")} Exams?**`).then(async msg => {
			// React with ✅ and ❌
			await msg.react("✅");
			await msg.react("❌");

			// Create a filter and a reaction collector
			const reactionFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id;
			const reactionCollector = msg.createReactionCollector(reactionFilter, {
				time: 60000
			});

			// When they react with either of the two above emoji
			reactionCollector.on("collect", async () => {
				// Stop the reaction collector and delete the message
				reactionCollector.stop();
				await msg.delete();

				// Empty grade string
				let grade = "";
				// Passing grades
				const passingGrades = ["A - Acceptable", "E - Exceeds Expectations", "O - Outstanding"];

				// Determine their grade
				if (amountOfSpellsLearned <= gradeInfo.T) {
					grade = "T - Troll";
				} else if (amountOfSpellsLearned <= gradeInfo.D) {
					grade = "D - Dreadful";
				} else if (amountOfSpellsLearned <= gradeInfo.P) {
					grade = "P - Poor";
				} else if (amountOfSpellsLearned <= gradeInfo.A) {
					grade = "A - Acceptable";
				} else if (amountOfSpellsLearned <= gradeInfo.E) {
					grade = "E - Exceeds Expectations";
				} else if (amountOfSpellsLearned <= gradeInfo.O) {
					grade = "O - Outstanding";
				}

				// If they have a passing grade
				if (passingGrades.includes(grade)) {
					// Set their grade
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, `stats.${examType}`);

					// Let them know they've leveled up
					await message.channel.send(examInfo[examType].passingMessage);

					if (examType === "owls") bot.levelUp(message.member, message.channel);
				} else {
					// They fail horribly
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, `stats.${examType}`);
					await message.channel.send(examInfo[examType].failingMessage);
				}
			});
		});

	},
};
