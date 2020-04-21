const Discord = require("discord.js");

module.exports = {
	name: "wand",
	description: "View your wand information.",
	async execute(message, args, bot) {
		const user = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]) || message.member;
		const userData = bot.userInfo.get(`${message.guild.id}-${user.id}`);

		const { core, wood, length, flexibility } = userData.wand;

		const wandEmbed = new Discord.MessageEmbed()
			.setAuthor(`${user.displayName}'s Wand`, user.user.displayAvatarURL)
			.setDescription(`**Core:** ${core}\n**Wood:** ${wood}\n**Length:** ${length}"\n**Flexibility:** ${flexibility}`)
			.setColor(user.displayHexColor)
			.setTimestamp();

		message.channel.send(wandEmbed);
	},
};
