const db = require("../utils/db.js");

module.exports = {
	name: "restart",
	description: "Restarts Hagrid.",
	async execute(message, args, bot) {
		if (message.author.id != bot.ownerId) return;

		if (db.guildInfo.get(message.guild.id, "curTrainingSession")) {
			return message.channel.send("There is currently a training session active.")
				.then(msg => msg.delete({ timeout: 5000 }) && message.delete({ timeout: 5000 }));
		}

		await message.channel.send("Restarting...");
		await process.exit();
	},
};
