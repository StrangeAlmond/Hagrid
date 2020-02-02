const Discord = require("discord.js");
const ms = require("parse-ms");
const moment = require("moment-timezone");

module.exports = {
	name: "weekly",
	description: "Claim your weekly chest.",
	aliases: ["weeklychest"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		if (!userData.studiedSpells.includes("cistem aperio")) return;

		const saturday = 6;
		const today = moment.tz("America/Los_Angeles").day();
		const saturdayObject = today <= saturday ? moment.tz("America/Los_Angeles").day(saturday) : moment.tz("America/Los_Angeles").add(1, "week").day(saturday);
		const timeTillSaturdayObject = ms(saturdayObject.hour(0).minute(0).valueOf() - Date.now());

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

		const galleons = galleonsObject[userData.year];

		if (!userData.inventory.trainingTokens) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, "inventory.trainingTokens");

		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", galleons, "balance.galleons");
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "inventory.trainingTokens");
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, saturdayObject.valueOf(), "cooldowns.nextWeekly");

		message.channel.send(`You have collected your ${galleons} weekly galleons and 1 training token.`);
	},
};
