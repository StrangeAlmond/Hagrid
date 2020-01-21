const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
	name: "exams",
	description: "Take your OWL exams.",
	aliases: ["owls"],
	async execute(message, args, bot) {
		// If the user isn't year 5 then don't let them use this command
		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "year") !== 5) return;

		// Valid weeks that users can use this command in
		const validWeeks = [12, 13, 25, 26, 38, 39, 51, 52];
		// Make sure the current week is equal to one of the above weeks
		if (!validWeeks.includes(moment().tz("America/Los_Angeles").week())) return;

		// Get the user's data from the db
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		// Amount of spells the user has learned
		const amountOfSpellsLearned = userData.studiedSpells.length;

		// Ask them if they're sure they want to take their exams
		message.channel.send("**__O.W.L.s__**\n\nO - Outstanding (25 spells/potions learned)\nE - Exceeds Expectations (23 spells/potions learned)\nA - Acceptable (21 spells/potions learned)\nFailing Grades P - Poor (15-20 spells/potions learned)\nD - Dreadful (6-14 spells/potions learned)\nT - Troll (0-5 spells/potions learned)\n\n**Are you sure you'd like to take your O.W.L Exams?**").then(async msg => {
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
				if (amountOfSpellsLearned <= 5) {
					grade = "T - Troll";
				} else if (amountOfSpellsLearned <= 14) {
					grade = "D - Dreadful";
				} else if (amountOfSpellsLearned <= 20) {
					grade = "P - Poor";
				} else if (amountOfSpellsLearned <= 21) {
					grade = "A - Acceptable";
				} else if (amountOfSpellsLearned <= 23) {
					grade = "E - Exceeds Expectations";
				} else if (amountOfSpellsLearned <= 25) {
					grade = "O - Outstanding";
				}

				// If they have a passing grade
				if (passingGrades.includes(grade)) {
					// Set their grade
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, "stats.owls");

					// Let them know they've leveled up
					await message.channel.send("You have passed your O.W.Ls and have been promoted to year 6.");

					// Execute the level up function
					bot.emit("levelUp", message.member, message.channel);
				} else {
					// They fail horribly
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, "stats.owls");
					await message.channel.send("You have failed your O.W.Ls. Come back when you've actually studied.");
				}
			});
		});

	},
};
