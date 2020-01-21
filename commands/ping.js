module.exports = {
	name: "ping",
	description: "Check the bot's current ping.",
	async execute(message, args, bot) {
		const msg = await message.channel.send("Pinging...");
		const ping = Date.now() - message.createdTimestamp;
		msg.edit(`Pong! - ${ping} ms`);
	},
};
