module.exports = {
	name: "expecto",
	description: "Cast the patronus charm.",
	async execute(message, args, bot) {
		if (args[0] != "patronum") return;

		const userData = bot.userInfo.get(message.author.key);
		if (userData.year < 5) return;

		if (!userData.studiedSpells.includes("expecto patronum")) return;

		const guildData = bot.guildInfo.get(message.guild.id);
		if (!guildData.spawns.some(s => s.type == "dementor" && s.channel == message.channel.id)) return;

		bot.guildInfo.remove(message.guild.id, (s) => s.channel == message.channel.id, "spawns");
		bot.userInfo.math(message.author.key, "+", 4, "stats.housePoints");
		bot.userInfo.inc(message.author.key, "stats.dementorsDefeated");

		message.channel.send(`Fantastic job ${message.member}! You have banished the dementor and have earned 4 points for your house!`);
	},
};
