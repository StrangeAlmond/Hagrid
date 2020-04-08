const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
	name: "bug",
	description: "Report a bug.",
	aliases: ["bugreport", "reportbug", "bugs"],
	async execute(message, args, bot) {
		const bugEmbed = new Discord.MessageEmbed()
			.setTitle(`🐛 Bug report from ${message.member.displayName}!`)
			.setColor("#FF0000")
			.addField("Description", args.join(" "), true)
			.addField("Message Link", message.url)
			.addField("Channel", message.channel.toString())
			.addField("Time", moment(message.createdTimestamp).tz("America/Los_Angeles").format("llll"))
			.addField("Images", message.attachments.size > 0 ? message.attachments.filter(a => a.width).map(a => a.url) : "N/A")
			.setTimestamp();
		message.guild.channels.cache.find(c => c.name.includes("bugs")).send(bugEmbed);
		message.react("✅");
	},
};
