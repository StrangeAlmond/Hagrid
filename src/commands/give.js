const Discord = require("discord.js");
const sm = require("string-similarity");
const inventoryItems = require("../jsonFiles/inventoryItems.json").map(i => `inventory.${i}`);
const otherItems = ["balance.knuts", "balance.sickles", "balance.galleons", "stats.merits", "xp"];

module.exports = {
	name: "give",
	description: "Give an item to a user.",
	async execute(message, args, bot) {
		if (message.author.id !== "356172624684122113" && message.author.id !== "137269251361865728") return;

		let mentionedUsers = message.mentions.members;
		if (args[0] === "all") mentionedUsers = message.guild.members.filter(m => bot.userInfo.has(`${message.guild.id}-${m.id}`));

		if (!mentionedUsers) return message.channel.send("Mention a user to give an item to! Proper Usage: `!give <@member> <amount> <item>`");

		args = args.slice(mentionedUsers.size);

		if (isNaN(args[0])) return message.channel.send("Specify how much of that item to give! Proper Usage: `!give <@member> <amount> <item>`");
		const amount = parseInt(args[0]);

		if (!args[1]) return message.channel.send("Specify what item to give! Proper Usage: `!give <@member> <amount> <item>`");
		const possibleItems = inventoryItems.concat(otherItems);

		const item = sm.findBestMatch(toCamelCase(args.slice(1).join(" ")), possibleItems).bestMatch.target;
		let usersMessage = "";

		mentionedUsers.forEach(mentionedUser => {

			bot.ensureUser(mentionedUser);
			if (!bot.userInfo.hasProp(`${message.guild.id}-${mentionedUser.id}`, item)) bot.userInfo.set(`${message.guild.id}-${mentionedUser.id}`, 0, item);

			bot.userInfo.math(`${message.guild.id}-${mentionedUser.id}`, "+", amount, item);

			usersMessage += `**${mentionedUser.displayName}** has received **${amount}** **${item.replace(/inventory./g, "").replace(/balance./g, "")}**.\n`;

			if (usersMessage.length > 1900) {
				message.channel.send(usersMessage);
				usersMessage = "";
			}
		});

		message.channel.send(usersMessage).then(msg => msg.delete(15000));
		message.delete(15000);

		function toCamelCase(str) {
			return str.split(" ").map(function (word, index) {
				if (index == 0) {
					return word.toLowerCase();
				}

				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}).join("");
		}
	},
};
