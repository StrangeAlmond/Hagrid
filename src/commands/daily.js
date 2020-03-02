const ms = require("parse-ms");
const moment = require("moment-timezone");

module.exports = {
	name: "daily",
	description: "Gives you your daily items.",
	aliases: ["d"],
	async execute(message, args, bot) {
		// Get the user's object from the db
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		// Get their last daily
		const lastDaily = userData.cooldowns.lastDaily;

		// Sickles and training tokens given
		let sickles = 6;
		let trainingTokens = 1;

		// If they've already gotten their daily today
		if (lastDaily === moment.tz("America/Los_Angeles").format("l")) {
			// Get the amount of time left until midnight
			const timeObj = ms(bot.timeUntilMidnight());

			// Send a message saying when they can use the daily command again
			return bot.quickWebhook(message.channel, `${message.member}, You can collect your daily sickles and training token again in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`, {
				username: "Gringotts Goblin",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
			});
		}

		if (userData.stats.activeEffects.some(e => e.type == "luck")) { // If the user has used a felix felicis potion
			const chance = Math.floor(Math.random() * 100);

			if (chance <= 30) { // Give them a 30% chance to get 2 extra sickles
				sickles += 2;
			}
		}

		// Give them <sickles> amount of sickles
		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", sickles, "balance.sickles");

		// If they don't have any training tokens in their inventory yet then set their training tokens value to 0
		if (!userData.inventory.trainingTokens) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, "inventory.trainingTokens");

		// Give them <trainingTokens> training tokens
		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", trainingTokens, "inventory.trainingTokens");
		// Set their lastDaily cooldown
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastDaily");

		// Send a message as the gringotts goblin webhook
		bot.quickWebhook(message.channel, `You have collected your ${sickles} daily sickles and 1 training token.`, {
			username: "Gringotts Goblin",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
		});
	},
};
