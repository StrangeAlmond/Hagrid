const Discord = require("discord.js");
const moment = require("moment-timezone");
const ms = require("parse-ms");

module.exports = {
	name: "silencio",
	description: "Silences the user for the given time.",
	aliases: ["mute", "silence"],
	async execute(message, args, bot) {
		if (!message.member.hasPermission("MANAGE_MESSAGES")) return;

		const userToMute = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]);
		if (!userToMute) return message.channel.send(`Specify a user to mute! Proper Usage: \`${bot.prefix}silencio <@member> <hours:minutes:seconds> <reason>\``);

		if (userToMute.hasPermission("MANAGE_MESSAGES")) return;
		if (userToMute.roles.find(r => r.name.toLowerCase() === "silenced")) return message.channel.send(`${userToMute.displayName} has already been muted!`);

		bot.ensureUser(userToMute);

		let temporary = true;
		let time = args[1].match(/\d+:\d+:\d+/g);
		if (!time) temporary = false;

		const reason = temporary ? args.slice(2).join(" ") : args.slice(1).join(" ");

		if (temporary) {
			time = time[0].split(/:/g).map(t => parseInt(t));

			const hours = time[0];
			const minutes = time[1];
			const seconds = time[2];

			const unmuteTime = moment.tz("America/Los_Angeles").add(hours, "hours").add(minutes, "minutes").add(seconds, "seconds");

			const muteObject = {
				unmuteTime: unmuteTime,
				reason: reason
			};

			bot.userInfo.set(`${message.guild.id}-${userToMute.id}`, muteObject, "muteObject");
		}

		bot.userInfo.inc(`${message.guild.id}-${userToMute.id}`, "stats.mutes");

		const timeObject = ms(bot.userInfo.get(`${message.guild.id}-${userToMute.id}`, "muteObject.unmuteTime") - Date.now());

		const silencedRole = message.guild.roles.find(r => r.name.toLowerCase() === "silenced");
		userToMute.addRole(silencedRole);

		const logChannel = message.guild.channels.find(c => c.name === "incidents");

		const embed = new Discord.RichEmbed()
			.setAuthor(`${userToMute.displayName} has been muted`, userToMute.user.displayAvatarURL)
			.setDescription(`**Time:** ${temporary ? `${timeObject.hours} hours, ${timeObject.minutes} minutes, and ${timeObject.seconds} seconds` : "Permanent"}\n**Reason:** ${reason}`)
			.setColor("#DD889F")
			.setTimestamp();

		bot.quickWebhook(logChannel, embed, {
			username: "Dolores Umbridge",
			avatar: "./images/webhook_avatars/doloresUmbridge.png"
		});

		message.channel.send(`${userToMute.displayName} has been ${!temporary ? "permanently muted" : `muted for **${timeObject.hours} hours**, **${timeObject.minutes} minutes**, and **${timeObject.seconds} seconds**`} for **${reason}**`);
	},
};
