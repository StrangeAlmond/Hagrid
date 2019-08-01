const Discord = require("discord.js");

module.exports = {
	name: "say",
	description: "Copy a user's message",
	async execute(message, args, bot) {
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		args = message.content.split(/ +/);
		args.shift();

		await message.delete();
		message.channel.send(args.join(" "));
	},
};
