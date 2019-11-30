const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const ms = require("parse-ms");

module.exports = {
	name: "about",
	description: "About hagrid",
	async execute(message, args, bot) {
		// Get the uptime
		const uptimeObject = ms(Date.now() - bot.uptime);
		const uptime = `${uptimeObject.hours}h, ${uptimeObject.minutes}m, ${uptimeObject.seconds}s`;

		// Get the tags of the developer and the designer
		const developer = bot.users.get("356172624684122113").tag;
		const designer = bot.users.get("137269251361865728").tag;

		// An array of user IDs to get tags from
		const specialThanks = ["330204257284521985", "339502515345293314", "362103171771793408", "341269487754149889"];

		// Create a RichEmbed
		const statsEmbed = new Discord.RichEmbed()
			.setColor(message.member.displayHexColor)
			.setThumbnail(bot.user.displayAvatarURL)
			.addField("Uptime", `${uptime}`)
			.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
			.addField("Version", botconfig.version)
			.addField("Library", `Discord.js v${Discord.version}`)
			.addField("Node.js", `${process.version}`)
			.addField("Credits", `Programmer: **${developer}**\nArtist and Designer: **${designer}**\n\nA special thanks to:\n**${specialThanks.map(u => bot.users.get(u).tag).join("\n")}**`)
			.setFooter("© 2019 StrangeAlmond#0001", bot.user.displayAvatarURL)
			.setTimestamp();

		// Send the RichEmbed
		message.channel.send(statsEmbed);
	},
};
