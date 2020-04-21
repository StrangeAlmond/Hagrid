const Discord = require("discord.js");
const moment = require("moment-timezone");
const examInfo = require("../jsonFiles/exams.json");

module.exports = {
	name: "exams",
	description: "Take either your OWL or NEWT exams.",
	async execute(message, args, bot) {
		const examType = args[0];
		if (!examType || !["owls"].includes(examType)) return message.channel.send(`Incorrect Usage. Proper Usage: \`${bot.prefix}exams [owls/newts]\``);

		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		if (examInfo[examType].requiredYear && examInfo[examType].requiredYear != userData.year) return;

		const validWeeks = [12, 13, 25, 26, 38, 39, 51, 52];
		if (!validWeeks.includes(moment.tz(bot.timezone).week())) return;

		const amountOfSpellsLearned = userData.studiedSpells.length;
		const gradeInfo = examInfo[examType].grades;
		const examTypeFormatted = examType.split("").map(i => i.toUpperCase()).join(".");

		const passingGradesMsg = `O - Outstanding (${gradeInfo.O} spells/potions learned)
E - Exceeds Expectations (${gradeInfo.E} spells/potions learned)
A - Acceptable (${gradeInfo.A} spells/potions learned)`;

		const failingGradesMsg = `P - Poor (${gradeInfo.D + 1}-${gradeInfo.P} spells/potions learned)
D - Dreadful (${gradeInfo.T + 1}-${gradeInfo.D} spells/potions learned)
T - Troll (0-${gradeInfo.T} spells/potions learned)`;

		const embed = new Discord.MessageEmbed()
			.setAuthor(examType.split("").map(i => i.toUpperCase()).join("."), message.author.displayAvatarURL())
			.addField("Passing Grades", passingGradesMsg)
			.addField("Failing Grades", `${failingGradesMsg}\n\n**Are you sure you'd like to take your ${examTypeFormatted} Exams?**`)
			.setTimestamp();

		const msg = await message.channel.send(embed);
		await msg.react("✅");
		await msg.react("❌");

		const reactionFilter = (reaction, user) => (reaction.emoji.name == "✅" || reaction.emoji.name == "❌") && user.id == message.author.id;
		const reactionCollector = msg.createReactionCollector(reactionFilter, {
			time: 60000
		});

		reactionCollector.on("collect", async collected => {
			reactionCollector.stop();

			if (collected.emoji.name == "❌") {
				message.delete();
				return msg.delete();
			}

			let grade = "";
			const passingGrades = ["A - Acceptable", "E - Exceeds Expectations", "O - Outstanding"];

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

			if (passingGrades.includes(grade)) {
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, `stats.${examType}`);
				await message.channel.send(examInfo[examType].passingMessage);
				if (examType == "owls") bot.levelUp(message.member, message.channel);
			} else {
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, `stats.${examType}`);
				await message.channel.send(examInfo[examType].failingMessage);
			}
		});
	},
};
