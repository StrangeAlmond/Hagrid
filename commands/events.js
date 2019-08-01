const Discord = require("discord.js");

module.exports = {
	name: "events",
	description: "View your guild's current events",
	async execute(message, args, bot) {
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		const events = bot.guildInfo.get(message.guild.id, "events").join(", ");

		message.channel.send(`Your guild currently has the following events active: ${events}`);
	},
};
