module.exports = {
	name: "add-event",
	description: "Add an event to your server's list of active events.",
	aliases: ["event-add"],
	async execute(message, args, bot) {
		if (![bot.ownerId, "137269251361865728"].includes(message.author.id)) return;

		const events = ["double-xp"];

		if (!args[0]) {
			return message.channel.send(`Specify an event to add! Possible events are: ${events.join(", ")}`);
		}

		if (!events.includes(args[0])) {
			return message.channel.send(`Invalid event! Possible events: ${events.join(", ")}`);
		}

		const event = events.find(e => e === args[0]);

		bot.guildInfo.push(message.guild.id, event, "events");
		message.channel.send(`Got it! I have added the ${event} event!`);
	},
};
