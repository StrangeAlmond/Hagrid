const Discord = require("discord.js");
const db = require("../utils/db.js");
const collectorsCards = require("../jsonFiles/collectorsCards.json");

module.exports = {
	name: "open",
	description: "Open an item.",
	async execute(message, args, bot) {
		if (["chocolate frog"].some(i => i.includes(args.join(" ")))) {
			const user = db.userInfo.get(message.author.key);
			if (!user.inventory.chocolateFrogs || user.inventory.chocolateFrogs <= 0) return message.channel.send("You don't have any chocolate frogs!");
			if (!user.collectorsItems) {
				db.userInfo.set(`${user.guild}-${user.user}`, {
					cards: []
				}, "collectorsItems");

				user.collectorsItems = {};
			}

			if (!user.collectorsItems.cards) {
				db.userInfo.set(`${user.guild}-${user.user}`, [], "collectorsItems.cards");
				user.collectorsItems.cards = [];
			}

			const rareChance = 1;
			const uncommonChance = 20;
			const chance = Math.random() * 100;

			let rarity;
			let card;

			if (chance <= rareChance) {
				rarity = "rare";
				const cards = collectorsCards["rare"];
				card = cards[Math.floor(Math.random() * cards.length)];
			} else if (chance <= uncommonChance) {
				rarity = "uncommon";
				const cards = collectorsCards["uncommon"];
				card = cards[Math.floor(Math.random() * cards.length)];
			} else {
				rarity = "common";
				const cards = collectorsCards["common"];
				card = cards[Math.floor(Math.random() * cards.length)];
			}

			let object = {
				"name": bot.functions.toCamelCase(card.toLowerCase()),
				"rarity": rarity,
				"amount": 0
			};

			if (user.collectorsItems.cards.some(c => bot.functions.fromCamelCase(c.name).toLowerCase() == card.toLowerCase())) {
				object = user.collectorsItems.cards.find(c => bot.functions.fromCamelCase(c.name).toLowerCase() == card.toLowerCase());
				user.collectorsItems.cards.splice(user.collectorsItems.cards.findIndex(c => bot.functions.fromCamelCase(c.name).toLowerCase() == card.toLowerCase()), 1);
			}

			object.amount++;

			user.collectorsItems.cards.push(object);

			db.userInfo.set(`${user.guild}-${user.user}`, user.collectorsItems.cards, "collectorsItems.cards");
			db.userInfo.dec(`${user.guild}-${user.user}`, "inventory.chocolateFrogs");

			const embed = new Discord.MessageEmbed()
				.setTitle(card)
				.setDescription(`As you open your chocolate frog the frop hops away. Luckily, your collectors card is still there. You got ${card}, which is a ${rarity} find.`)
				.setThumbnail("attachment://image.png")
				.setColor(message.member.displayHexColor)
				.setTimestamp();

			message.channel.send({
				embed,
				files: [{
					attachment: `../images/collectibles/${rarity}/${bot.functions.toCamelCase(card)}.png`,
					name: "image.png"
				}]
			});

		}
	},
};
