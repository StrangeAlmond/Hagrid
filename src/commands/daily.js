const db = require("../utils/db.js");
const moment = require("moment-timezone");

module.exports = {
	name: "daily",
	description: "Gives you your daily items.",
	aliases: ["d"],
	async execute(message, args, bot) {
		const userData = db.userInfo.get(message.author.key);
		const lastDaily = userData.cooldowns.lastDaily;

		let sickles = 6;
		let trainingTokens = 1;

		if (lastDaily == moment.tz("America/Los_Angeles").format("l")) {
			const timeObj = bot.functions.parseMs(bot.functions.timeUntilMidnight(), true);

			return bot.functions.quickWebhook(message.channel, `${message.member}, You can collect your daily sickles and training token again in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`, {
				username: "Gringotts Goblin",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
			});
		}

		if (userData.stats.activeEffects.some(e => e.type == "luck")) {
			const chance = Math.floor(Math.random() * 100);

			if (chance <= 30) sickles += 2;
		}

		db.userInfo.math(message.author.key, "+", sickles, "balance.sickles");

		if (!userData.inventory.trainingTokens) db.userInfo.set(message.author.key, 0, "inventory.trainingTokens");
		db.userInfo.math(message.author.key, "+", trainingTokens, "inventory.trainingTokens");
		db.userInfo.set(message.author.key, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastDaily");

		bot.functions.quickWebhook(message.channel, `You have collected your ${sickles} daily sickles and 1 training token.`, {
			username: "Gringotts Goblin",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
		});
	},
};
