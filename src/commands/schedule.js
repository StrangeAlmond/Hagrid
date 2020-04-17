module.exports = {
	name: "schedule",
	description: "View this months training schedule.",
	aliases: ["training-schedule", "training_schedule"],
	async execute(message, args, bot) {
		const channel = await message.guild.channels.cache.find(r => r.name == "training-schedule");
		const messages = await channel.messages.fetch();
		const schedule = messages.last().content;

		if (!schedule) return message.channel.send("No training schedule was found.");

		message.channel.send(schedule);
	},
};
