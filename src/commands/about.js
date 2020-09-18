const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports = {
	name: "about",
	description: "About hagrid and the people who worked on it.",
	async execute(message, args, bot) {
		const uptime = bot.functions.parseMs(bot.uptime, true);
		const uptimeMsg = `${uptime.days}d, ${uptime.hours}h, ${uptime.minutes}m, ${uptime.seconds}s`;

		const developer = bot.users.cache.get(bot.ownerId).tag;
		const designer = bot.users.cache.get("137269251361865728").tag;
		const specialThanks = ["330204257284521985", "339502515345293314", "362103171771793408", "341269487754149889"];

		const statsEmbed = new Discord.MessageEmbed()
			.setColor(message.member.displayHexColor)
			.setThumbnail(bot.user.displayAvatarURL())
			.addField("Uptime", `${uptimeMsg}`)
			.addField("Memory Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
			.addField("Version", botconfig.version)
			.addField("Library", `Discord.js v${Discord.version}`)
			.addField("Node.js", `${process.version}`)
			.addField("Credits", `Programmer: **${developer}**\nArtist and Designer: **${designer}**\n\nA special thanks to:\n**${specialThanks.map(u => bot.users.cache.get(u).tag).join("\n")}**`)
			.setFooter("© 2019 StrangeAlmond#2475", bot.user.displayAvatarURL)
			.setTimestamp();

		message.channel.send(statsEmbed);
	},
};
