const Discord = require("discord.js");

module.exports = {
	name: "restart",
	description: "Restarts Hagrid.",
	async execute(message, args, bot) {
		if (message.author.id !== "356172624684122113") return;

		if (bot.guildInfo.get(message.guild.id, "curTrainingSession")) return message.channel.send("There is currently a training session active.").then(msg => msg.delete(5000) && message.delete(5000));

		await message.channel.send("Restarting...");
		await process.exit();
	},
};
