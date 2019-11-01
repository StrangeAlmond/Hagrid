const Discord = require("discord.js");

module.exports = {
	name: "add-event",
	description: "Add an event",
	aliases: ["event-add"],
	async execute(message, args, bot) {
		// Make sure only ChesterLampwick and StrangeAlmond can use this command.
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		// Possible events that can be added.
		const events = ["double-xp"];

		// Make sure they specify an event and specify a valid event.
		if (!args[0]) return message.channel.send(`Specify an event to add! Possible events are: ${events.join(", ")}`);
		if (!events.includes(args[0])) return message.channel.send(`Invalid event! Possible events: ${events.join(", ")}`);

		// Identify the event they chose.
		const event = events.find(e => e === args[0]);

		// Add the event to their guild data.
		bot.guildInfo.push(message.guild.id, event, "events");

		// Send a message saying that we've added the event
		message.channel.send(`Got it! I have added the ${event} event!`);
	},
};
