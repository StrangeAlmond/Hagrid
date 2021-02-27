const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "stats",
	description: "View your statistics.",
	async execute(message, args, bot) {
		const user = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]) || message.member;
		const usersData = db.userInfo.get(`${message.guild.id}-${user.id}`);

		const stats = {
			"Beans Eaten": "beansEaten",
			"Training Sessions": "trainingSessions",
			"Damage Dealt in Training Sessions": "trainingSessionDamage",
			"Training Sessions Defeated": "trainingSessionsDefeated",
			"Trivia Questions Answered": "triviaAnswered",
			"Dementors Defeated": "dementorsDefeated",
			"Boggarts Defeated": "boggartsDefeated",
			"Times Fainted": "faints",
			"Chests Opened": "chestsOpened",
			"Duels Won": "duelsWon",
			"Duels Lost": "duelsLost",
			"Forages": "forages",
			"Potions Brewed": "potionsMade",
			"Potions Used": "potionsUsed",
			"Purchases": "purchases",
			"Pranks": "pranks",
			"Prestiges": "prestiges"
		};

		let usersStats = Object.entries(stats).map(i => `**${i[0]}:** ${usersData.stats[i[1]]}`);
		const lifetimeEarnings = Object.keys(usersData.lifetimeEarnings)
			.map(i => `${usersData.lifetimeEarnings[i]} ${bot.functions.capitalizeFirstLetter(i)}`).join(", ");
		usersStats.push(`**Lifetime Earnings:** ${lifetimeEarnings}`);

		const statsEmbed = new Discord.MessageEmbed()
			.setAuthor(`${user.displayName}'s Stats`, user.user.displayAvatarURL())
			.setColor(user.displayHexColor)
			.setDescription(usersStats.join("\n"))
			.setTimestamp();
		message.channel.send(statsEmbed);
	},
};
