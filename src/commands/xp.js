const Discord = require("discord.js");
const numeral = require("numeral");
const yearsFile = require("../jsonFiles/years.json");

module.exports = {
	name: "xp",
	description: "View your XP.",
	aliases: ["year"],
	async execute(message, args, bot) {
		const user = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
		const userData = bot.userInfo.get(`${message.guild.id}-${user.id}`);

		const xpToLevelUp = userData.year === 7 ? 0 : yearsFile[userData.year + 1].xp - userData.xp;

		const embedDescription = `
    **Year:** ${userData.year}
    **XP:** ${numeral(userData.xp).format("0,0")}
    **Lifetime XP:** ${numeral(userData.stats.lifetimeXp).format("0,0")}
    **XP until next year:** ${numeral(xpToLevelUp).format("0,0")}`;

		const xpEmbed = new Discord.RichEmbed()
			.setAuthor(`${user.displayName}'s XP`, user.user.displayAvatarURL)
			.setColor(user.displayHexColor)
			.setDescription(embedDescription)
			.setTimestamp();
		message.channel.send(xpEmbed);
	},
};
