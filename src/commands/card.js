const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "card",
	description: "View a specific Collectors Card",
	async execute(message, args, bot) {
		if (!args[0]) return message.channel.send("Specify which card you would like to view!");

		const user = db.userInfo.get(message.author.key);
		if (!user.collectorsItems || !user.collectorsItems.cards) {
			return message.channel.send("You don't have any collectors cards! You can find some by buying chocolate frogs in Hogsmeade and opening them.");
		}

		const card = user.collectorsItems.cards.find(c => bot.functions.fromCamelCase(c.name).toLowerCase().includes(args.join(" ")));
		if (!card) return message.channel.send("You either don't have that card or it doesn't exist!");

		const embed = new Discord.MessageEmbed()
			.setTitle(bot.functions.fromCamelCase(card.name))
			.setImage("attachment://image.png")
			.setColor(message.member.displayHexColor)
			.setTimestamp();

		message.channel.send({
			embed,
			files: [{
				attachment: `../images/collectibles/${card.rarity}/${bot.functions.capitalizeFirstLetter(card.name)}.png`,
				name: "image.png"
			}]
		});
	},
};
