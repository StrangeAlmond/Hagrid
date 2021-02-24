const Discord = require("discord.js");
const db = require("../utils/db.js");
const collectorsCards = require("../jsonFiles/collectorsCards.json");

module.exports = {
	name: "cards",
	description: "View your collectors cards",
	aliases: ["collectorsCards", "collectorCards"],
	async execute(message, args, bot) {
		const user = db.userInfo.get(message.author.key);
		if (!user.collectorsItems || !user.collectorsItems.cards) {
			return message.channel.send("You don't have any collectors cards! You can find some by buying chocolate frogs in Hogsmeade and opening them.");
		}

		const rareCards = user.collectorsItems.cards.filter(c => c.rarity == "rare");
		const uncommonCards = user.collectorsItems.cards.filter(c => c.rarity == "uncommon");
		const commonCards = user.collectorsItems.cards.filter(c => c.rarity == "common");

		const msg = `
${rareCards.length > 0 ? `**Rare:**
${rareCards.map(c => bot.functions.fromCamelCase(c.name)).join("\n")}

${rareCards.length}/${collectorsCards.rare.length} Rare Cards Collected` : ""}

${uncommonCards.length > 0 ? `**Uncommon:**
${uncommonCards.map(c => bot.functions.fromCamelCase(c.name)).join("\n")}

${uncommonCards.length}/${collectorsCards.uncommon.length} Uncommon Cards Collected` : ""}

${commonCards.length > 0 ? `**Common:**
${commonCards.map(c => bot.functions.fromCamelCase(c.name)).join("\n")}

${commonCards.length}/${collectorsCards.common.length} Common Cards Collected` : ""}

${user.collectorsItems.cards.length}/${collectorsCards.rare.length + collectorsCards.uncommon.length + collectorsCards.common.length} Collected Total.
`;

		const embed = new Discord.MessageEmbed()
			.setAuthor("Your Collectors Cards", message.author.displayAvatarURL())
			.setDescription(msg)
			.setColor(message.member.displayHexColor)
			.setFooter(`To view a specific card, use \`${bot.prefix}card <card name>\``)
			.setTimestamp();

		message.channel.send(embed);
	},
};
