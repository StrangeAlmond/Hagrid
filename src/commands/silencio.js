const Discord = require("discord.js");
const db = require("../utils/db.js");
const moment = require("moment-timezone");

module.exports = {
	name: "silencio",
	description: "Silences the user for the given time.",
	aliases: ["mute", "silence"],
	async execute(message, args, bot) {
		if (!message.member.hasPermission("MANAGE_MESSAGES")) return;

		const userToMute = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]);

		if (!userToMute) return message.channel.send(`Specify a user to mute! Proper Usage: \`${bot.prefix}silencio <@member> <hours:minutes:seconds> <reason>\``);
		if (userToMute.id == bot.user.id) return message.channel.send("After all my good work *this* is how you repay me? What a disgrace.");
		if (userToMute.hasPermission("MANAGE_MESSAGES")) return;
		if (userToMute.roles.cache.find(r => r.name.toLowerCase() == "silenced")) {
			return message.channel.send(`${userToMute.displayName} has already been muted!`);
		}

		bot.functions.ensureUser(userToMute, bot);

		let temporary = true;
		let time = args[1].match(/\d+:\d+:\d+/g); // Matches hours:minutes:seconds
		if (!time) temporary = false;

		const reason = temporary ? args.slice(2).join(" ") : args.slice(1).join(" ");

		if (temporary) {
			time = time[0].split(/:/g).map(t => parseInt(t));

			const hours = time[0];
			const minutes = time[1];
			const seconds = time[2];

			const unmuteTime = moment
				.tz(bot.timezone)
				.add(hours, "hours")
				.add(minutes, "minutes")
				.add(seconds, "seconds");

			const muteObject = {
				unmuteTime: unmuteTime,
				reason: reason
			};

			db.userInfo.set(`${message.guild.id}-${userToMute.id}`, muteObject, "muteObject");
		}

		db.userInfo.inc(`${message.guild.id}-${userToMute.id}`, "stats.mutes");

		const timeObject = bot.functions.parseMs(db.userInfo.get(`${message.guild.id}-${userToMute.id}`, "muteObject.unmuteTime") - Date.now(), true);

		const silencedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() == "silenced");
		userToMute.roles.add(silencedRole);

		const logChannel = message.guild.channels.cache.find(c => c.name == "incidents");

		const embed = new Discord.MessageEmbed()
			.setAuthor(`${userToMute.displayName} has been muted`, userToMute.user.displayAvatarURL())
			.setDescription(`**Time:** ${temporary ? `${timeObject.hours}h ${timeObject.minutes}m ${timeObject.seconds}s` : "Permanent"}\n**Reason:** ${reason}`)
			.setColor("#DD889F")
			.setTimestamp();

		bot.functions.quickWebhook(logChannel, embed, {
			username: "Dolores Umbridge",
			avatar: "../images/webhook_avatars/doloresUmbridge.png"
		});

		message.channel.send(`${userToMute.displayName} has been ${!temporary ?
			"permanently muted" :
			`muted for **${timeObject.hours}h**, **${timeObject.minutes}m**, and **${timeObject.seconds}s**`} for **${reason}**`);
	},
};
