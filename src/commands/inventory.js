const Discord = require("discord.js");
const sm = require("string-similarity");

module.exports = {
	name: "inventory",
	description: "View your inventory.",
	aliases: ["inv", "bag", "items", "things", "stuff", "mystuff"],
	async execute(message, args, bot) {

		if (args[0] && !message.mentions.members.first()) {
			let item = toCamelCase(args.join(" "));

			if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${item}`)) {
				const possibleItems = Object.keys(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "inventory"));
				item = sm.findBestMatch(toCamelCase(args.join(" ")), possibleItems).bestMatch.target;
			}

			const itemEmbed = new Discord.RichEmbed()
				.setAuthor("Inventory Search", message.author.displayAvatarURL)
				.setColor(message.member.displayHexColor)
				.setDescription(`**${item.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:** ${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, `inventory.${item}`)}`)
				.setTimestamp();
			message.channel.send(itemEmbed);
		} else {
			// get the user's GuildMember object
			const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
			const memberData = bot.userInfo.get(`${message.guild.id}-${member.id}`);

			// Create a variable for the inventory message
			let usersInventoryMessage = Object
				.entries(memberData.inventory) // Get all the entries from their inventory in a [key, value] format
				.filter(i => i[1] > 0) // Filter out items which the user does not have
				.sort((i, j) => i[0].localeCompare(j[0])) // Sort it alphabetically
				.map(i => `${i[0].replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}: ${i[1]}`) // Convert the key into a user-readable format
				.join("\n"); // Join it all together seperated by a line break

			// Create an embed for displaying their inventory
			const inventoryEmbed = new Discord.RichEmbed()
				.setAuthor(`${member.displayName}'s Inventory`, member.user.displayAvatarURL)
				.setDescription(usersInventoryMessage)
				.setColor(member.displayHexColor)
				.setTimestamp();

			// Send the embed
			message.channel.send(inventoryEmbed);
		}

		function toCamelCase(str) {
			return str.split(" ").map((word, index) => {
				if (index == 0) return word.toLowerCase();

				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}).join("");
		}
	},
};
