const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "remove-event",
	description: "Remove an event from your server's list of active events.",
	async execute(message, args, bot) {
		if (![bot.ownerId, "137269251361865728"].includes(message.author.id)) return;

		const events = ["double-xp"];

		if (!args[0]) {
			return message.channel.send(`Specify an event to remove! Possible events are: ${events.join(", ")}`);
		}

		if (!events.includes(args[0])) {
			return message.channel.send(`Invalid event! Possible events: ${events.join(", ")}`);
		}

		const event = events.find(e => e == args[0]);
		db.guildInfo.remove(message.guild.id, event, "events");
		message.channel.send(`Got it! I have removed the ${event} event!`);
	},
};
