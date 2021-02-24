const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "balance",
	description: "Display your current amount of knuts, sickles, and galleons.",
	aliases: ["bal"],
	async execute(message, args, bot) {
		const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
		const memberData = db.userInfo.get(`${message.guild.id}-${member.id}`);

		const knuts = memberData.balance.knuts;
		const sickles = memberData.balance.sickles;
		const galleons = memberData.balance.galleons;

		const balance = new Discord.MessageEmbed()
			.setAuthor(`${member.displayName}'s Balance`, member.user.displayAvatarURL())
			.setDescription(`**Knuts:** ${knuts}\n**Sickles:** ${sickles}\n**Galleons:** ${galleons}`)
			.setColor(member.displayHexColor)
			.setTimestamp("Your Balance")
			.setTimestamp();

		bot.functions.quickWebhook(message.channel, balance, {
			username: "Gringotts Goblin",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
		});
	},
};
