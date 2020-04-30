const Discord = require("discord.js");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "badge",
	description: "The main badges command, this command allows you to get a list of badges, give someone a badge, revoke someone's badge, view your own badges, or view a specific badge's info.",
	aliases: ["badges"],
	async execute(message, args, bot) {
		const staffRoles = ["Headmaster", "Deputy Headmaster", "Heads of House", "Auror", "Support Staff", "Prefect", "Head Girl", "Head Boy"];

		if (args[0] == "list" || !args[0]) {
			const badgesEmbed = new Discord.MessageEmbed()
				.setAuthor("Available Badges", message.author.displayAvatarURL())
				.setColor(message.member.displayHexColor)
				.setFooter("Use !badge add <badge id> <@member> to add a badge to a member")
				.setTimestamp();

			await badges.forEach(badge => {
				badgesEmbed.addField(`${bot.emojis.cache.get(badge.emojiID)} - ${badge.name} (#${badge.id})`, badge.description);
			});

			message.channel.send(badgesEmbed);
		} else if (args[0] == "add" || args[0] == "grant" || args[0] == "give") {
			if (!staffRoles.some(r => message.member.roles.cache.find(i => i.name.toLowerCase() == r.toLowerCase()))) return;

			if (!args[1]) return message.channel.send(`Proper Usage: ${bot.prefix}\`badge add <id> <@member>\``);
			if (args[1].startsWith("#")) args[1] = args[1].slice(1);
			if (!badges.some(b => b.id == args[1])) return message.channel.send(`Proper Usage: \`${bot.prefix}badge add <id> <@member>\``);

			const members = message.mentions.members;
			const badge = badges.find(b => b.id == args[1]);

			members.forEach(async member => {
				bot.functions.ensureUser(member, bot);

				if (bot.userInfo.get(`${message.guild.id}-${member.id}`, "badges").includes(badge.credential)) {
					const failEmbed = new Discord.MessageEmbed()
						.setAuthor(`Failed to give ${member.displayName} a badge`, member.user.displayAvatarURL())
						.setDescription(`${member.displayName} already has that badge`)
						.setColor("#c91414")
						.setTimestamp();

					return message.channel.send(failEmbed);
				}

				bot.userInfo.push(`${message.guild.id}-${member.id}`, badge.credential, "badges");

				const badgeAddedEmbed = new Discord.MessageEmbed()
					.setAuthor("Badge Added", member.user.displayAvatarURL())
					.setDescription(`${member.displayName} has been given the ${bot.emojis.cache.get(badge.emojiID)} ${badge.name} (${badge.description})`)
					.setThumbnail(bot.emojis.cache.get(badge.emojiID).url)
					.setColor(member.displayHexColor)
					.setTimestamp();
				message.channel.send(badgeAddedEmbed);
			});
		} else if (args[0] == "remove" || args[0] == "revoke") {
			if (!staffRoles.some(r => message.member.roles.cache.find(i => i.name == r))) return;

			if (!args[1] || !args[2]) return message.channel.send(`Proper Usage: \`${bot.prefix} remove <id> <@member>\``);
			if (args[1].startsWith("#")) args[1] = args[1].slice(1);
			if (!badges.some(b => b.id == args[1])) return message.channel.send(`Proper Usage: \`${bot.prefix} remove <id> <@member>\``);

			const members = message.mentions.members;
			const badge = badges.find(b => b.id == args[1]);

			members.forEach(async member => {
				bot.functions.ensureUser(member, bot);

				const usersBadges = bot.userInfo.get(`${message.guild.id}-${member.id}`, "badges");

				if (!usersBadges.includes(badge.credential)) {
					const failEmbed = new Discord.MessageEmbed()
						.setAuthor(`Failed to remove a badge from ${member.displayName}`, member.user.displayAvatarURL())
						.setDescription(`${member.displayName} doesn't have that badge`)
						.setColor("#c91414")
						.setTimestamp();
					return message.channel.send(failEmbed);
				}

				usersBadges.splice(usersBadges.indexOf(badge.credential), 1);

				const badgeAddedEmbed = new Discord.MessageEmbed()
					.setAuthor("Badge Removed", member.user.displayAvatarURL())
					.setDescription(`${member.displayName}'s ${bot.emojis.get(badge.emojiID)} ${badge.name} (${badge.description}) has been removed`)
					.setThumbnail(bot.emojis.cache.get(badge.emojiID).url)
					.setColor(member.displayHexColor)
					.setTimestamp();
				message.channel.send(badgeAddedEmbed);
			});
		} else if (args[0] == "profile") {
			const usersBadges = bot.userInfo.get(message.author.key, "badges");
			if (usersBadges.length <= 0) return message.channel.send("You have not earned any badges.");

			let badgesDescription = "You have earned the following badges:\n\n";

			await usersBadges.forEach(badge => {
				badge = badges.find(b => b.credential == badge);
				badgesDescription += `${bot.emojis.cache.get(badge.emojiID) ? bot.emojis.cache.get(badge.emojiID) : ""} ${badge.name}\n`;
			});

			const badgesEmbed = new Discord.MessageEmbed()
				.setAuthor(`${message.member.displayName}'s Badges`, message.author.displayAvatarURL())
				.setDescription(badgesDescription)
				.setColor(message.member.displayHexColor)
				.setTimestamp();
			message.channel.send(badgesEmbed);

		} else if (badges.some(b => b.id == args[0])) {
			const badge = badges.find(b => b.id == args[0]);

			const badgeEmbed = new Discord.MessageEmbed()
				.addField(`${bot.emojis.cache.get(badge.emojiID)} - ${badge.name}`, badge.description)
				.setColor(message.member.displayHexColor)
				.setTimestamp();
			message.channel.send(badgeEmbed);

		}
	},
};
