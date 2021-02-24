const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "reset",
	description: "Reset a members daily, butterbeer, weekly, or study cooldown.",
	async execute(message, args, bot) {
		if (![bot.ownerId, "137269251361865728"].includes(message.author.id)) return;
		if (!args[0]) {
			return message.channel.send(`Specify a cooldown to reset! Proper Usage: \`${bot.prefix}reset <daily/butterbeer/weekly/study> <@member>\``);
		}

		const user = bot.functions.getUserFromMention(args[1], message.guild) || message.guild.members.cache.get(args[1]);
		if (!user) {
			return message.channel.send(`Specify a member! Proper Usage: \`${bot.prefix}reset <daily/butterbeer/weekly/study> <@member>\``);
		}

		const validCooldowns = ["daily", "butterbeer", "weekly", "study"];
		if (!validCooldowns.includes(args[0])) {
			return message.channel.send(`Invalid cooldown! Proper Usage: \`${bot.prefix}reset <daily/butterbeer/weekly/study> <@member>\``);
		}

		const cooldownKey = `cooldowns.last${args[0].charAt(0).toUpperCase() + args[0].slice(1)}`;
		db.userInfo.set(`${message.guild.id}-${user.id}`, null, cooldownKey);
		message.channel.send(`I have reset ${user.displayName}'s !${args[0]} cooldown!`)
			.then(msg => msg.delete({ timeout: 5000 }) && message.delete({ timeout: 5000 }));
	},
};
