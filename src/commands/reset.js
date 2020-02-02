const Discord = require("discord.js");

module.exports = {
	name: "reset",
	description: "Reset a members daily, merit, weekly, or study cooldown.",
	async execute(message, args, bot) {
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;
		if (!args[0]) return message.channel.send(`Specify a cooldown to reset! Proper Usage: \`${bot.prefix}reset <daily/merit/weekly/study> <@member>\``);

		const user = bot.getUserFromMention(args[1], message.guild) || message.guild.members.get(args[1]);
		if (!user) return message.channel.send(`Specify a member! Proper Usage: \`${bot.prefix}reset <daily/merit/weekly/study> <@member>\``);

		const validCooldowns = ["daily", "merit", "weekly", "study"];
		if (!validCooldowns.includes(args[0])) return message.channel.send(`Invalid cooldown! Proper Usage: \`${bot.prefix}reset <daily/merit/weekly/study> <@member>\``);

		bot.userInfo.set(`${message.guild.id}-${user.id}`, null, `cooldowns.last${args[0].charAt(0).toUpperCase() + args[0].slice(1)}`);
		message.channel.send(`I have reset ${user.displayName}'s !${args[0]} cooldown!`).then(msg => msg.delete(5000) && message.delete(5000));
	},
};
