const Discord = require("discord.js");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "badge",
	description: "The main badges command, this command allows you to get a list of badges, give someone a badge, revoke someone's badge, view your own badges, or view a specific badge's info.",
	aliases: ["badges"],
	async execute(message, args, bot) {
		// List of staff roles, a user is required to have at least one of these roles for certain commands.
		const staffRoles = ["Headmaster", "Deputy Headmaster", "Heads of House", "Auror", "Support Staff", "Prefect", "Head Girl", "Head Boy"];

		// If they just want to get a list of badges in the guild.
		if (args[0] === "list" || !args[0]) {
			// Make an embed that will contain the list of badges.
			const badgesEmbed = new Discord.RichEmbed()
				.setAuthor("Available Badges", message.author.displayAvatarURL)
				.setColor(message.member.displayHexColor)
				.setFooter("Use !badge add <badge id> <@member> to add a badge to a member")
				.setTimestamp();

			// Added a new field to the embed for each badge the guild has.
			await badges.forEach(badge => {
				badgesEmbed.addField(`${bot.emojis.get(badge.emojiID)} - ${badge.name} (#${badge.id})`, badge.description);
			});

			// Send the embed.
			message.channel.send(badgesEmbed);
		} else if (args[0] === "add" || args[0] === "grant") { // If they want to give someone a badge.
			// Make sure they have a staff role
			if (!staffRoles.some(r => message.member.roles.find(i => i.name.toLowerCase() === r.toLowerCase()))) return;
			// Make sure they're using a valid bagde id.
			if (!badges.some(b => b.id === args[1])) return message.channel.send("Proper Usage: `!badge add <id> <@member>`");
			// If they included a "#" in their id then remove it.
			if (args[1].startsWith("#")) args[1] = args[1].slice(1);

			// Get the list of memebrs they mentioned and the badge they specified the id for.
			const members = message.mentions.members;
			const badge = badges.find(b => b.id === args[1]);

			// For each member
			members.forEach(async member => {

				// Make sure they're in the database
				bot.ensureUser(member);

				// If they already have the badge
				if (bot.userInfo.get(`${message.guild.id}-${member.id}`, "badges").includes(badge.credential)) {
					// Create an embed
					const failEmbed = new Discord.RichEmbed()
						.setAuthor(`Failed to give ${member.displayName} a badge`, member.user.displayAvatarURL)
						.setDescription(`${member.displayName} already has that badge`)
						.setColor("#c91414")
						.setTimestamp();

					// Send the embed and don't execute any further code for this member.
					return message.channel.send(failEmbed);
				}

				// Add the badge credential to their badges.
				bot.userInfo.push(`${message.guild.id}-${member.id}`, badge.credential, "badges");

				// Create an embed
				const badgeAddedEmbed = new Discord.RichEmbed()
					.setAuthor("Badge Added", member.user.displayAvatarURL)
					.setDescription(`${member.displayName} has been given the ${bot.emojis.get(badge.emojiID)} ${badge.name} (${badge.description})`)
					.setThumbnail(bot.emojis.get(badge.emojiID).url)
					.setColor(member.displayHexColor)
					.setTimestamp();

				// Send the embed
				message.channel.send(badgeAddedEmbed);
			});
		} else if (args[0] === "remove" || args[0] === "revoke") { // If they want to take away a user's badge.
			// Make sure the user executing the command is a staff member.
			if (!staffRoles.some(r => message.member.roles.find(i => i.name === r))) return;
			// Make sure they've specified an actual badge.
			if (!badges.some(b => b.id === args[1])) return message.channel.send("Proper Usage: `!badge add <id> <@member>`");
			// If they used a "#" in their badge id remove it from the id.
			if (args[1].startsWith("#")) args[1] = args[1].slice(1);

			// Get the list of members they mentioned and the badge they specified the id for.
			const members = message.mentions.members;
			const badge = badges.find(b => b.id === args[1]);

			// For each member they mentioned
			members.forEach(async member => {
				// Ensure they have a db entry.
				bot.ensureUser(member);

				// Get a list of the member's badges.
				const usersBadges = bot.userInfo.get(`${message.guild.id}-${member.id}`, "badges");

				// If the user doesn't have this badge
				if (!usersBadges.includes(badge.credential)) {
					// Make an embed.
					const failEmbed = new Discord.RichEmbed()
						.setAuthor(`Failed to remove a badge from ${member.displayName}`, member.user.displayAvatarURL)
						.setDescription(`${member.displayName} doesn't have that badge`)
						.setColor("#c91414")
						.setTimestamp();
					// Send the embed, without executing any further code for this member.
					return message.channel.send(failEmbed);
				}

				// Remove the badge credential from their badges
				usersBadges.splice(usersBadges.indexOf(badge.credential), 1);

				// Create an embed.
				const badgeAddedEmbed = new Discord.RichEmbed()
					.setAuthor("Badge Removed", member.user.displayAvatarURL)
					.setDescription(`${member.displayName}'s ${bot.emojis.get(badge.emojiID)} ${badge.name} (${badge.description}) has been removed`)
					.setThumbnail(bot.emojis.get(badge.emojiID).url)
					.setColor(member.displayHexColor)
					.setTimestamp();
				// Send the embed.
				message.channel.send(badgeAddedEmbed);
			});
		} else if (args[0] === "profile") { // If they want to view their badge profile
			// Get a list of their badges.
			const usersBadges = bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "badges");
			// If the user doesn't have any badges send a message saying so and don't execute any further code.
			if (usersBadges.length <= 0) return message.channel.send("You have not earned any badges.");

			// Create a starting message for their badges list.
			let badgesDescription = "You have earned the following badges:\n\n";

			// For each of their badges.
			await usersBadges.forEach(badge => {
				// Get the badge object
				badge = badges.find(b => b.credential === badge);
				// Add the emoji and name to the list.
				badgesDescription += `${bot.emojis.get(badge.emojiID) ? bot.emojis.get(badge.emojiID) : ""} ${badge.name}\n`;
			});

			// Create an embed for displaying their badges.
			const badgesEmbed = new Discord.RichEmbed()
				.setAuthor(`${message.member.displayName}'s Badges`, message.author.displayAvatarURL)
				.setDescription(badgesDescription)
				.setColor(message.member.displayHexColor)
				.setTimestamp();
			// Send the embed.
			message.channel.send(badgesEmbed);

		} else if (badges.some(b => b.id === args[0])) { // If they want to view information about a badge.
			// Get the badge's object.
			const badge = badges.find(b => b.id === args[0]);
			// Create an embed for it.
			const badgeEmbed = new Discord.RichEmbed()
				.addField(`${bot.emojis.get(badge.emojiID)} - ${badge.name}`, badge.description)
				.setColor(message.member.displayHexColor)
				.setTimestamp();
			// Send the embed.
			message.channel.send(badgeEmbed);

		}
	},
};
