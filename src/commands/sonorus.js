// TODO: Test command
const Discord = require("discord.js");

module.exports = {
	name: "sonorus",
	description: "Unsilences a wizard.",
	aliases: ["unmute", "unsilence", "unsilencio"],
	async execute(message, args, bot) {
		if (!message.member.hasPermission("MANAGE_MESSAGES")) return;

		const userToUnmute = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]);
		if (!userToUnmute) {
			return message.channel.send(`Specify a user to unmute! Proper Usage: \`${bot.prefix}sonorus <@member>\``);
		}

		if (!userToUnmute.roles.cache.find(r => r.name.toLowerCase() == "silenced")) {
			return message.channel.send("They haven't been silenced!");
		}

		const incidentsChannel = message.guild.channels.cache.find(c => c.name == "incidents");
		if (!incidentsChannel) return;

		const webhookOptions = {
			username: "Dolores Umbridge",
			avatar: "../images/webhook_avatars/doloresUmbridge.png"
		};

		const mutedRole = await message.guild.roles.cache.find(r => r.name == "Silenced");
		await userToUnmute.roles.remove(mutedRole);

		bot.userInfo.set(`${message.guild.id}-${userToUnmute.id}`, null, "muteObject");

		const embed = new Discord.MessageEmbed()
			.setAuthor(`${userToUnmute.displayName} has been unmuted`, userToUnmute.user.displayAvatarURL())
			.setColor("#633039")
			.setDescription(`**User:** ${userToUnmute.displayName}\n**Moderator:** ${message.member.displayName}`)
			.setFooter(`${message.member.displayName} unmuted ${userToUnmute.displayName}`)
			.setTimestamp();

		bot.functions.quickWebhook(incidentsChannel, embed, webhookOptions);
		message.channel.send(`${userToUnmute.displayName} has been unmuted`);
	},
};
