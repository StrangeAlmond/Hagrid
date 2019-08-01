const Discord = require("discord.js");

module.exports = {
	name: "cistem",
	description: "Open a chest",
	async execute(message, args, bot) {
		if (args[0] !== "aperio") return;

		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		if (!userData.studiedSpells.includes("cistem aperio")) return;

		const guildData = bot.guildInfo.get(message.guild.id);

		if (!guildData.spawns.some(s => s.type === "chest" && s.channel === message.channel.id)) return;

		bot.guildInfo.removeFrom(message.guild.id, "spawns", guildData.spawns.find(s => s.channel === message.channel.id));
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "balance.sickles");
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.chestsOpened");

		message.channel.send(`Fantastic job ${message.member}! You opened the chest and found 1 sickle!`);
	},
};
