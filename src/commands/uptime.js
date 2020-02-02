const Discord = require("discord.js");

module.exports = {
	name: "uptime",
	description: "View Hagrid's uptime.",
	async execute(message, args, bot) {
		let totalSeconds = (bot.uptime / 1000);

		const hours = Math.floor(totalSeconds / 3600);

		totalSeconds %= 3600;

		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.round(totalSeconds % 60);
		const days = Math.round(totalSeconds / 86400000);

		const uptime = new Discord.RichEmbed()
			.setAuthor("Uptime")
			.setColor(message.member.displayHexColor)
			.setDescription(`${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`)
			.setFooter(bot.user.username, bot.user.displayAvatarURL)
			.setTimestamp();
		message.channel.send(uptime);
	},
};
