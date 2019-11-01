const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
	name: "bug",
	description: "Report a bug",
	aliases: ["bugreport", "reportbug", "bugs"],
	async execute(message, args, bot) {
		// Create an embed for displaying the information about this bug.
		const bugEmbed = new Discord.RichEmbed()
			.setTitle(`🐛 Bug report from ${message.member.displayName}!`)
			.setColor("#FF0000")
			.addField("Description", args.join(" "), true)
			.addField("Message Link", message.url)
			.addField("Channel", message.channel.toString())
			.addField("Time", moment(message.createdTimestamp).tz("America/Los_Angeles").format("llll"))
			.addField("Images", message.attachments.size > 0 ? message.attachments.filter(a => a.width).map(a => a.url) : "N/A")
			.setTimestamp();
		// Find the bugs channel and send the embed to it
		message.guild.channels.find(c => c.name.includes("bugs")).send(bugEmbed);
		// React with a checkmark to the embed.
		message.react("✅");
	},
};
