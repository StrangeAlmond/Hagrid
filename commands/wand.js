const Discord = require("discord.js");

module.exports = {
	name: "wand",
	description: "View your wand information",
	async execute(message, args, bot) {
		const user = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]) || message.member;
		const userData = bot.userInfo.get(`${message.guild.id}-${user.id}`);

		const core = userData.wand.core;
		const wood = userData.wand.wood;
		const length = `${userData.wand.length}"`;
		const flexibility = `${userData.wand.flexibility}`;

		const wandEmbed = new Discord.RichEmbed()
			.setAuthor(`${user.displayName}'s Wand`, user.user.displayAvatarURL)
			.setDescription(`**Core:** ${core}\n**Wood:** ${wood}\n**Length:** ${length}\n**Flexibility:** ${flexibility}`)
			.setColor(user.displayHexColor)
			.setTimestamp();

		message.channel.send(wandEmbed);
	},
};
