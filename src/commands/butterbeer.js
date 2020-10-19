const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
	name: "butterbeer",
	description: "Give your fellow wizards a butterbeer.",
	aliases: ["m"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);
		const lastButterbeer = userData.cooldowns.lastButterbeer;

		if (!args[0]) {
			const butterbeerEmbed = new Discord.MessageEmbed()
				.setTitle(`${message.member.displayName}'s Butterbeer`)
				.setColor(message.member.displayHexColor)
				.setDescription(`${message.member} has ${userData.stats.butterbeer} butterbeers`)
				.setFooter(`${message.member.displayName}'s Butterbeer`)
				.setTimestamp();
			return message.channel.send(butterbeerEmbed);
		}

		const mUser = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]);

		if (!mUser) message.channel.send("That user doesn't exist in the wizarding world. Remember, muggles can't have butterbeer!");
		if (mUser.id == message.author.id) return message.channel.send("You can't give yourself a butterbeer!");
		if (mUser.user.bot) return message.channel.send("You can't give a butterbeer to a bot! You'll fry their electronics!");

		if (lastButterbeer == moment.tz("America/Los_Angeles").format("l")) {
			const timeObj = bot.functions.parseMs(bot.functions.timeUntilMidnight(), true);
			return message.channel.send(`You can award another butterbeer in ${timeObj.hours} hours, ${timeObj.minutes} minutes, and ${timeObj.seconds} seconds.`);
		}

		bot.functions.ensureUser(mUser, bot);
		bot.userInfo.inc(`${message.guild.id}-${mUser.id}`, "stats.butterbeer");
		bot.userInfo.set(message.author.key, moment.tz("America/Los_Angeles").format("l"), "cooldowns.lastButterbeer");

		message.channel.send(`Congratulations ${mUser.displayName}! You have received a butterbeer from ${message.member.displayName}.`);
	},
};
