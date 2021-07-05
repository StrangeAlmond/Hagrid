const db = require("../utils/db.js");
const sm = require("string-similarity");
const otherItems = ["balance.knuts", "balance.sickles", "balance.galleons", "stats.butterbeer", "xp"];
const inventoryItems = Object.keys(require("../jsonFiles/inventoryItems.json")).map(i => `inventory.${i}`);

module.exports = {
	name: "give",
	description: "Give an item to a user.",
	async execute(message, args, bot) {
		if (![bot.ownerId, "137269251361865728"].includes(message.author.id)) return;

		const properUsage = `Proper Usage: \`${bot.prefix}give <@member> <amount> <item>\``;

		let mentionedUsers = message.mentions.members;
		if (args[0] == "all") mentionedUsers = message.guild.members.cache.filter(m => !m.user.bot);

		if (!mentionedUsers) {
			return message.channel.send(`Mention a user to give an item to! ${properUsage}`);
		}

		if (args[0] != "all") args = args.slice(mentionedUsers.size);

		if (isNaN(args[0])) {
			return message.channel.send(`Specify how much of that item to give! ${properUsage}`);
		}

		const amount = parseInt(args[0]);

		if (!args[1]) return message.channel.send(`Specify what item to give! ${properUsage}`);
		const possibleItems = inventoryItems.concat(otherItems);

		const item = sm.findBestMatch(bot.functions.toCamelCase(args.slice(1).join(" ")), possibleItems).bestMatch.target;
		let usersMessage = "";

		mentionedUsers.forEach(mentionedUser => {
			bot.functions.ensureUser(mentionedUser, bot);
			if (!db.userInfo.has(`${message.guild.id}-${mentionedUser.id}`, item)) {
				db.userInfo.set(`${message.guild.id}-${mentionedUser.id}`, 0, item);
			}

			db.userInfo.math(`${message.guild.id}-${mentionedUser.id}`, "+", amount, item);
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
