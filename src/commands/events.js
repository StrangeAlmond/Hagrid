const Discord = require("discord.js");

module.exports = {
	name: "events",
	description: "View your server's current active events.",
	async execute(message, args, bot) {
		// Make sure only ChesterLampwick and StrangeAlmond can use this command.
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		// Get a list of the current events and seperate them with a comma (,).
		const events = bot.guildInfo.get(message.guild.id, "events").join(", ");

		// Send a message with the events
		message.channel.send(`Your guild currently has the following events active: ${events}`);
	},
};
