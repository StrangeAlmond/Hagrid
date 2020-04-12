module.exports = {
	name: "events",
	description: "Lists your guild's currently active events.",
	async execute(message, args, bot) {
		// Only bot admins can use this command
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		const events = bot.guildInfo.get(message.guild.id, "events").join(", ");
		if (events.length < 1) return message.channel.send("Your guild has no events active.");
		message.channel.send(`Your guild currently has the following events active: ${events}`);
	},
};
