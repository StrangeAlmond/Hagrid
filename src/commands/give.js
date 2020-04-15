const sm = require("string-similarity");
const inventoryItems = require("../jsonFiles/inventoryItems.json").map(i => `inventory.${i}`);
const otherItems = ["balance.knuts", "balance.sickles", "balance.galleons", "stats.merits", "xp"];

module.exports = {
	name: "give",
	description: "Give an item to a user.",
	async execute(message, args, bot) {
		if (message.author.id != bot.ownerId && message.author.id != "137269251361865728") return;

		let mentionedUsers = message.mentions.members;
		if (args[0] == "all") mentionedUsers = message.guild.members.cache.filter(m => !m.user.bot);

		if (!mentionedUsers) return message.channel.send("Mention a user to give an item to! Proper Usage: `!give <@member> <amount> <item>`");

		if (args[0] != "all") {
			args = args.slice(mentionedUsers.size);
		}

		if (isNaN(args[1])) return message.channel.send("Specify how much of that item to give! Proper Usage: `!give <@member> <amount> <item>`");
		const amount = parseInt(args[1]);

		if (!args[2]) return message.channel.send("Specify what item to give! Proper Usage: `!give <@member> <amount> <item>`");
		const possibleItems = inventoryItems.concat(otherItems);

		const item = sm.findBestMatch(bot.functions.toCamelCase(args.slice(1).join(" ")), possibleItems).bestMatch.target;
		let usersMessage = "";

		mentionedUsers.forEach(mentionedUser => {
			bot.functions.ensureUser(mentionedUser, bot);
			if (!bot.userInfo.hasProp(`${message.guild.id}-${mentionedUser.id}`, item)) {
				bot.userInfo.set(`${message.guild.id}-${mentionedUser.id}`, 0, item);
			}

			bot.userInfo.math(`${message.guild.id}-${mentionedUser.id}`, "+", amount, item);
			usersMessage += `**${mentionedUser.displayName}** has received **${amount}** **${item.replace(/inventory./g, "").replace(/balance./g, "")}**.\n`;

			if (usersMessage.length > 1900) {
				message.channel.send(usersMessage);
				usersMessage = "";
			}
		});

		message.channel.send(usersMessage).then(m => m.delete({ timeout: 15000 }));
		message.delete({ timeout: 15000 });
	},
};
