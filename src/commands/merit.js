const moment = require("moment-timezone");

module.exports = {
	name: "merit",
	description: "Give your fellow wizards a merit.",
	aliases: ["m"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);
		const lastMerit = userData.cooldowns.lastMerit;

		const webhookObject = {
			username: "Ministry of Magic",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/f/f7/Wizengamot_seal.png/revision/latest?cb=20161124001208",
			deleteAfterUse: true
		};

		if (lastMerit == moment.tz("America/Los_Angeles").format("l")) {
			const timeObj = bot.function.parseMs(bot.functions.timeUntilMidnight(), true);
			return bot.functions.quickWebhook(message.channel,
				`You can award more merits in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`, webhookObject);
		}

		if (!args[0]) return bot.functions.quickWebhook(message.channel, "You can award one merit!", webhookObject);

		const mUser = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]);

		if (!mUser) return bot.functions.quickWebhook(message.channel, "I couldn't find that user!", webhookObject);
		if (mUser.id == message.author.id) {
			return bot.functions.quickWebhook(message.channel, "You can't give yourself a merit!", webhookObject);
		}
		if (mUser.user.bot) return bot.functions.quickWebhook(message.channel, "You can't merit a bot!", webhookObject);

		bot.functions.ensureUser(mUser, bot);

		bot.userInfo.inc(`${message.guild.id}-${mUser.id}`, "stats.merits");
		bot.userInfo.set(message.author.id, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastMerit");

		bot.functions.quickWebhook(message.channel,
			`Congratulations ${mUser.displayName}! You have received a merit from ${message.member.displayName}.`,
			webhookObject);

	},
};
