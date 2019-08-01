const Discord = require("discord.js");

module.exports = {
	name: "schedule",
	description: "The training schedule for the next week",
	aliases: ["training-schedule", "training_schedule"],
	async execute(message, args, bot) {
		const channel = await message.guild.channels.find(r => r.name === "training-schedule");
		const messages = await channel.fetchMessages();
		const schedule = messages.last().content;

		message.channel.send(schedule);
	},
};
