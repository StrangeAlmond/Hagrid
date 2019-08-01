const Discord = require("discord.js");

module.exports = {
	name: "expecto",
	description: "Expecto Patronum",
	async execute(message, args, bot) {
		if (args[0] !== "patronum") return;

		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		if (userData.year < 5) return;
		if (!userData.studiedSpells.includes("expecto patronum")) return;

		const guildData = bot.guildInfo.get(message.guild.id);
		if (!guildData.spawns.some(s => s.type === "dementor" && s.channel === message.channel.id)) return;

		bot.guildInfo.removeFrom(message.guild.id, "spawns", guildData.spawns.find(s => s.channel === message.channel.id));
		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 4, "stats.housePoints");
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.dementorsDefeated");

		message.channel.send(`Fantastic job ${message.member}! You have banished the dementor and have earned 4 points for your house!`);
	},
};
