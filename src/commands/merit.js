const ms = require("parse-ms");
const moment = require("moment-timezone");

module.exports = {
	name: "merit",
	description: "Give a fellow wizard a merit.",
	aliases: ["m"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		const lastMerit = userData.cooldowns.lastMerit;

		const webhookObject = {
			username: "Ministry of Magic",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
			deleteAfterUse: true
		};

		if (lastMerit === moment.tz("America/Los_Angeles").format("l")) {
			const timeObj = ms(bot.timeUntilMidnight());
			return bot.quickWebhook(message.channel, `You can award more merits in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`, webhookObject);
		}

		if (!args[0]) return bot.quickWebhook(message.channel, "You can award one merit!", webhookObject);

		const mUser = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]);

		if (!mUser) return bot.quickWebhook(message.channel, "I couldn't find that user!", webhookObject);
		if (mUser.id === message.author.id) return bot.quickWebhook(message.channel, "You can't give yourself a merit!", webhookObject);
		if (mUser.user.bot) return bot.quickWebhook(message.channel, "You can't merit a bot!", webhookObject);

		bot.ensureUser(mUser);

		bot.userInfo.inc(`${message.guild.id}-${mUser.id}`, "stats.merits");
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastMerit");

		bot.quickWebhook(message.channel, `Congratulations ${mUser.displayName}! You have received a merit from ${message.member.displayName}.`, webhookObject);

	},
};
