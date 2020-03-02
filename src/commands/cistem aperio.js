module.exports = {
	name: "cistem",
	description: "Open a chest.",
	async execute(message, args, bot) {
		// Make sure the full message is "!cistem aperio"
		if (args[0] !== "aperio") return;

		// Get the user's data object
		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
		// Make sure the user has studied cistem aperio
		if (!userData.studiedSpells.includes("cistem aperio")) return;

		// Get the guild's data object
		const guildData = bot.guildInfo.get(message.guild.id);

		// Make sure there is a chest to open in this channel
		if (!guildData.spawns.some(s => s.type === "chest" && s.channel === message.channel.id)) return;

		// Remove the spawn from the guild data
		bot.guildInfo.removeFrom(message.guild.id, "spawns", guildData.spawns.find(s => s.channel === message.channel.id));
		// Increase the user's sickles by 1
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "balance.sickles");
		// Increase their chests opened stat by 1
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.chestsOpened");

		// Send a message letting them know they opened the chest
		message.channel.send(`Fantastic job ${message.member}! You opened the chest and found 1 sickle!`);
	},
};
