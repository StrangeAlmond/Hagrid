const db = require("../utils/db.js");

module.exports = {
	name: "cistem",
	description: "Open a chest.",
	async execute(message, args, bot) {
		if (args[0] != "aperio") return;

		const userData = db.userInfo.get(message.author.key);
		if (!userData.studiedSpells.includes("cistem aperio")) return;

		const guildData = db.guildInfo.get(message.guild.id);
		if (!guildData.spawns.some(s => s.type == "chest" && s.channel == message.channel.id)) return;

		db.guildInfo.remove(message.guild.id, (s) => s.channel == message.channel.id, "spawns");
		db.userInfo.inc(message.author.key, "balance.sickles");
		db.userInfo.inc(message.author.key, "stats.chestsOpened");

		message.channel.send(`Fantastic job ${message.member}! You opened the chest and found 1 sickle!`);
	},
};
