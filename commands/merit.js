const ms = require("parse-ms");
const moment = require("moment-timezone");

module.exports = {
	name: "merit",
	description: "Give a user a merit!",
	aliases: ["m"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		const lastMerit = userData.cooldowns.lastMerit;

		if (lastMerit === moment.tz("America/Los_Angeles").format("l")) {
			const timeObj = ms(bot.timeUntilMidnight());

			return bot.quickWebhook(message.channel, `You can award more merits in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`, {
				username: "Ministry of Magic",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
				deleteAfterUse: true
			});
		}

		if (!args[0]) {
			return bot.quickWebhook(message.channel, "You can award one merit!", {
				username: "Ministry of Magic",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
				deleteAfterUse: true
			});
		}

		const mUser = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]);

		if (!mUser) {
			return bot.quickWebhook(message.channel, "I couldn't find that user!", {
				username: "Ministry of Magic",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
				deleteAfterUse: true
			});
		}

		if (mUser.id === message.author.id) {
			return bot.quickWebhook(message.channel, "You can't give yourself a merit!", {
				username: "Ministry of Magic",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
				deleteAfterUse: true
			});
		}

		if (mUser.user.bot) {
			return bot.quickWebhook(message.channel, "You can't merit a bot!", {
				username: "Ministry of Magic",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
				deleteAfterUse: true
			});
		}

		bot.ensureUser(mUser);

		bot.quickWebhook(message.channel, `Congratulations ${mUser.displayName}! You have received a merit from ${message.member.displayName}.`, {
			username: "Ministry of Magic",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
			deleteAfterUse: true
		});

		bot.userInfo.inc(`${message.guild.id}-${mUser.id}`, "stats.merits");
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastMerit");

	},
};
