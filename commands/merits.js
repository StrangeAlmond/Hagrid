const Discord = require("discord.js");

module.exports = {
	name: "merits",
	description: "View how many merits you have.",
	async execute(message, args, bot) {
		const user = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
		const uMerits = bot.userInfo.get(`${message.guild.id}-${user.id}`, "stats.merits");

		const meritsEmbed = new Discord.RichEmbed()
			.setTitle(`${user.displayName}'s Merits`)
			.setColor(user.displayHexColor)
			.setDescription(`${user} has ${uMerits} merits`)
			.setFooter(`${user.displayName}'s Merits`)
			.setTimestamp();
		message.channel.send(meritsEmbed);
	},
};
