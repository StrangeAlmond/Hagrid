const Discord = require("discord.js");
const db = require("../utils/db.js");
const items = require("../jsonFiles/shop.json");

module.exports = {
	name: "shop",
	description: "View a shop's items.",
	async execute(message, args, bot) {
		const shops = {
			"Diagon Alley": {
				"categories": ["hagrids hut", "hogwarts", "forbidden forest"],
				"shops": [{
					id: 3,
					name: "Magical Menagerie"
				},
				{
					id: 5,
					name: "Potages"
				},
				{
					id: 7,
					name: "Slug & Jiggers Apothecary"
				},
				{
					id: 9,
					name: "Wiseacre's Wizarding Equipment"
				}
				]
			},

			"Hogsmeade": {
				"categories": ["hogsmeade"],
				"shops": [{
					id: 10,
					name: "Honeydukes"
				},
				{
					id: 11,
					name: "J. Pippin's Potions"
				},
				{
					id: 16,
					name: "Zonko's Joke Shop"
				},
				]
			},

			"Knockturn Alley": {
				"categories": ["knockturn alley"],
				"shops": [{
					id: 20,
					name: "Borgin and Burkes"
				}]
			}
		};

		if (!args[0]) {
			const shop = Object.keys(shops)
				.find(s => shops[s].categories.includes(message.channel.parent.name.toLowerCase()));
			const shopsMessage = shops[shop].shops.map(s => `**!shop ${s.id}** - ${s.name}`);

			return message.channel.send(shopsMessage);
		}

		const shop = shops[Object.keys(shops).find(s => shops[s].categories.includes(message.channel.parent.name.toLowerCase()))];
		const shopIDs = shop.shops.map(s => s.id);

		if (!shopIDs.includes(parseInt(args[0]))) return message.channel.send("❌ | Invalid shop.");

		const shopName = shop.shops.find(s => s.id == parseInt(args[0])).name;
		let shopItems = Object.values(items)
			.filter(s => shopName.toLowerCase() == s.shop.toLowerCase()).map(i => `**${i.id}** ${i.name} - ${i.price}`);

		const shopEmbed = new Discord.MessageEmbed()
			.setAuthor(shop.shops.find(s => s.id == shopIDs.find(i => i == parseInt(args[0]))).name, message.author.displayAvatarURL())
			.setColor(message.member.displayHexColor)
			.setDescription(shopItems)
			.setFooter(`You have ${db.userInfo.get(message.author.key, "balance.knuts")} knuts, ${db.userInfo.get(message.author.key, "balance.sickles")} sickles, and ${db.userInfo.get(message.author.key, "balance.galleons")} galleons`)
			.setTimestamp();

		if (shopName == "Magical Menagerie") {
			shopItems = Object.values(items).filter(s => shopName.toLowerCase() == s.shop.toLowerCase());

			const formattedTierOnePets = shopItems.filter(i => i.tier == 1).map(i => `**${i.id}** ${i.name} - ${i.price}`);
			const formattedTierTwoPets = shopItems.filter(i => i.tier == 2).map(i => `**${i.id}** ${i.name} - ${i.price}`);

			const pets = db.userInfo.get(message.author.key, "pets").filter(p => !p.retired);
			const pet = pets[0];

			shopEmbed.setDescription(`**Tier 1**\n${formattedTierOnePets.join("\n")}\n\n${pet && (pet.level == 7 || pet.tier == 2) ? `**Tier 2**\n${formattedTierTwoPets.join("\n")}` : ""}`);
		}

		message.channel.send(shopEmbed);
	},
};
