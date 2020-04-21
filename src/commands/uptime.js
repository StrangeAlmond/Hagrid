const Discord = require("discord.js");

module.exports = {
	name: "uptime",
	description: "View Hagrid's uptime.",
	async execute(message, args, bot) {
		const uptime = bot.functions.parseMs(bot.uptime, true);
		const uptimeEmbed = new Discord.MessageEmbed()
			.setAuthor("Uptime")
			.setColor(message.member.displayHexColor)
			.setDescription(`${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes, and ${uptime.seconds} seconds`)
			.setFooter(bot.user.username, bot.user.displayAvatarURL())
			.setTimestamp();
		message.channel.send(uptimeEmbed);
	},
};
