const Discord = require("discord.js");

module.exports = {
	name: "balance",
	description: "Display your current amount of knuts, sickles, and galleons.",
	aliases: ["bal"],
	async execute(message, args, bot) {
		// Get the member object of the user who's balance we should get
		const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
		const memberData = bot.userInfo.get(`${message.guild.id}-${member.id}`);

		// Get the users knuts, sickles, and galleons
		const knuts = memberData.balance.knuts;
		const sickles = memberData.balance.sickles;
		const galleons = memberData.balance.galleons;

		// Create an RichEmbed with the users balance
		const balance = new Discord.RichEmbed()
			.setAuthor(`${member.displayName}'s Balance`, member.user.displayAvatarURL)
			.setDescription(`**Knuts:** ${knuts}\n**Sickles:** ${sickles}\n**Galleons:** ${galleons}`)
			.setColor(member.displayHexColor)
			.setTimestamp("Your Balance")
			.setTimestamp();

		// Send the balance embed
		bot.quickWebhook(message.channel, balance, {
			username: "Gringotts Goblin",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
		});

	},
};
