const Discord = require("discord.js");

module.exports = {
	name: "expecto",
	description: "Expecto Patronum",
	async execute(message, args, bot) {
		// Make sure the whole message is "!expecto patronum"
		if (args[0] !== "patronum") return;

		// Get the user's data from the db
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		// If the user is year 4 or below don't let them use the command
		if (userData.year < 5) return;

		// Make sure they've actually studied this spell
		if (!userData.studiedSpells.includes("expecto patronum")) return;

		// Get the guild's data from the db
		const guildData = bot.guildInfo.get(message.guild.id);
		// Make sure there's a dementor in this channel
		if (!guildData.spawns.some(s => s.type === "dementor" && s.channel === message.channel.id)) return;

		// Remove the spawn from the channel
		bot.guildInfo.removeFrom(message.guild.id, "spawns", guildData.spawns.find(s => s.channel === message.channel.id));
		// Give the user 4 house points and increment their dementorsDefeated stat
		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 4, "stats.housePoints");
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.dementorsDefeated");

		// Let them know they defeated the dementor
		message.channel.send(`Fantastic job ${message.member}! You have banished the dementor and have earned 4 points for your house!`);
	},
};
