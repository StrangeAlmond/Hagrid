const db = require("../utils/db.js");

module.exports = {
	name: "leave",
	description: "Deletes your maze channel.",
	aliases: ["exit", "done", "delete"],
	async execute(message, args, bot) {
		if (!bot.functions.isMazeChannel(message.channel.name, message.member)) return;
		if (db.userInfo.get(message.author.key, "mazeInfo.inFight")) return;

		message.channel.delete();
	},
};
