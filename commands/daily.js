const Discord = require("discord.js");
const ms = require("parse-ms");
const moment = require("moment-timezone");

module.exports = {
	name: "daily",
	description: "Gives you your daily sickle",
	aliases: ["d"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		const lastDaily = userData.cooldowns.lastDaily;

		const sickles = 6;
		const trainingTokens = 1;

		if (lastDaily === moment.tz("America/Los_Angeles").format("l")) {
			const timeObj = ms(bot.timeUntilMidnight());

			return bot.quickWebhook(message.channel, `${message.member}, You can collect your daily sickles and training token again in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`, {
				username: "Gringotts Goblin",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
			});
		}

		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", sickles, "balance.sickles");

		if (!userData.inventory.trainingTokens) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, "inventory.trainingTokens");

		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", trainingTokens, "inventory.trainingTokens");
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastDaily");

		bot.quickWebhook(message.channel, `You have collected your ${sickles} daily sickles and 1 training token.`, {
			username: "Gringotts Goblin",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
		});
	},
};
