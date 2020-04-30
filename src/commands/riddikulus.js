module.exports = {
	name: "riddikulus",
	description: "Banish a boggart.",
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);
		if (userData.year < 3) return;
		if (!userData.studiedSpells.includes("riddikulus")) return;

		const guildData = bot.guildInfo.get(message.guild.id);
		if (!guildData.spawns.some(s => s.type == "boggart" && s.channel == message.channel.id)) return;

		bot.guildInfo.removeFrom(message.guild.id, "spawns", guildData.spawns.find(s => s.channel == message.channel.id));
		bot.userInfo.math(message.author.key, "+", 2, "stats.housePoints");
		bot.userInfo.inc(message.author.key, "stats.boggartsDefeated");

		message.channel.send(`Fantastic job ${message.member}! You have banished the boggart and have earned 2 points for your house!`);
	},
};
