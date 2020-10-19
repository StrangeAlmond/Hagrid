const Discord = require("discord.js");

module.exports = {
	name: "leaderboard",
	aliases: ["board"],
	description: "View your server's leaderboard.",
	async execute(message, args, bot) {
		if (!args[0]) {
			const guildInfo = bot.guildInfo.get(message.guild.id);
			const houses = Object.entries(guildInfo.housePoints).sort((a, b) => b[1] - a[1]);

			const leaderboardEmbed = new Discord.MessageEmbed()
				.setAuthor("House Points Leaderboard", message.guild.iconURL())
				.setColor(message.member.displayHexColor)
				.setTimestamp();

			for (const house of houses) {
				leaderboardEmbed.addField(bot.functions.capitalizeFirstLetter(house[0]), `${house[1]} house points`);
			}

			return message.channel.send(leaderboardEmbed);
		}

		const leaderboards = {
			"house points": "stats.housePoints",
			"xp": "stats.lifetimeXp",
			"butterbeer": "stats.butterbeer",
			"purchases": "stats.purchases",
			"forages": "stats.forages",
			"potions made": "stats.potionsMade",
			"potions used": "stats.potionsUsed",
			"beans": "stats.beansEaten",
			"trivia": "stats.triviaAnswered",
			"chests": "stats.chestsOpened",
			"dementors": "stats.dementorsDefeated",
			"boggarts": "stats.boggartsDefeated",
			"duels won": "stats.duelsWon",
			"duels lost": "stats.duelsLost",
			"max health": "stats.maxHealth",
			"galleons": "balance.galleons",
			"sickles": "balance.sickles",
			"knuts": "balance.knuts"
		};

		const leaderboardEntries = Object.entries(leaderboards);
		const leaderboardDetails = leaderboardEntries.find(entry => entry[0].includes(args.join(" ")));
		if (!leaderboardDetails) return;

		const leaderboardName = leaderboardDetails[0];
		const leaderboardKey = leaderboardDetails[1];

		const users = bot.userInfo.array().filter(u => bot.userInfo.get(`${u.guild}-${u.user}`, leaderboardKey) != 0 && u.guild == message.guild.id);
		const sortedUsers = users.sort((a, b) => bot.userInfo.get(`${b.guild}-${b.user}`, leaderboardKey) - bot.userInfo.get(`${a.guild}-${a.user}`, leaderboardKey));
		const leaderboard = sortedUsers.splice(0, 10);

		const leaderboardEmbed = new Discord.MessageEmbed()
			.setAuthor(`${formatLeaderboardName(leaderboardName)} Leaderboard`, message.guild.iconURL())
			.setColor(message.member.displayHexColor)
			.setTimestamp();

		for (const user of leaderboard) {
			leaderboardEmbed.addField(message.guild.members.cache.get(user.user).displayName,
				`${bot.userInfo.get(`${user.guild}-${user.user}`, leaderboardKey)} ${formatLeaderboardName(leaderboardName)}`);
		}

		message.channel.send(leaderboardEmbed);

		function formatLeaderboardName(name) { // Formats the title of the leaderboard into a human-friendly format
			return name.split(/ +/).map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(" ");
		}
	}
};
