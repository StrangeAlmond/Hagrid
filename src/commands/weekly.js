const ms = require("parse-ms");
const moment = require("moment-timezone");

module.exports = {
	name: "weekly",
	description: "Claim your weekly chest.",
	aliases: ["weeklychest"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);

		if (!userData.studiedSpells.includes("cistem aperio")) return;

		const saturday = 6;
		const today = moment.tz("America/Los_Angeles").day();
		const saturdayObject = today <= saturday ?
			moment.tz("America/Los_Angeles").day(saturday).hour(0).minute(0) :
			moment.tz("America/Los_Angeles").add(1, "week").day(saturday).hour(0).minute(0);
		const timeTillSaturdayObject = bot.functions.parseMs(saturdayObject.valueOf() - Date.now(), true);

		const nextWeekly = userData.cooldowns.nextWeekly;

		if (nextWeekly && Date.now() < nextWeekly) {
			return message.channel.send(`You can collect your weekly chest again in ${timeTillSaturdayObject.days} days, ${timeTillSaturdayObject.hours} hours, ${timeTillSaturdayObject.minutes} minutes, and ${timeTillSaturdayObject.seconds} seconds.`);
		}

		const galleonsObject = {
			4: 2,
			5: 4,
			6: 4,
			7: 6
		};

		const galleons = galleonsObject[userData.year] || 0;

		if (!userData.inventory.trainingTokens) {
			bot.userInfo.set(message.author.key, 0, "inventory.trainingTokens");
		}

		bot.userInfo.math(message.author.key, "+", galleons, "balance.galleons");
		bot.userInfo.inc(message.author.key, "inventory.trainingTokens");
		bot.userInfo.set(message.author.key, saturdayObject.valueOf(), "cooldowns.nextWeekly");

		message.channel.send(`You have collected your ${galleons} weekly galleons and 1 training token.`);
	},
};
