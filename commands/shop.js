const Discord = require("discord.js");
const items = require("../jsonFiles/shop.json");

module.exports = {
	name: "shop",
	description: "Open the shop",
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
			}
		};

		if (!args[0]) {
			const shop = Object.keys(shops).find(s => shops[s].categories.includes(message.channel.parent.name.toLowerCase()));
			const shopsMessage = shops[shop].shops.map(s => `**!shop ${s.id}** - ${s.name}`);

			return message.channel.send(shopsMessage);
		}

		const shop = shops[Object.keys(shops).find(s => shops[s].categories.includes(message.channel.parent.name.toLowerCase()))];
		const shopIDs = shop.shops.map(s => s.id);

		if (!shopIDs.includes(parseInt(args[0]))) return message.channel.send("❌ | Invalid shop.");

		const shopName = shop.shops.find(s => s.id === parseInt(args[0])).name;
		const shopItems = Object.values(items).filter(s => shopName.toLowerCase() === s.shop.toLowerCase()).map(i => `**${i.id}** ${i.name} - ${i.price}`);

		const shopEmbed = new Discord.RichEmbed()
			.setAuthor(shop.shops.find(s => s.id === shopIDs.find(i => i === parseInt(args[0]))).name, message.author.displayAvatarURL)
			.setColor(message.member.displayHexColor)
			.setDescription(shopItems)
			.setFooter(`You have ${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.knuts")} knuts, ${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.sickles")} sickles, and ${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.galleons")} galleons`)
			.setTimestamp();
		message.channel.send(shopEmbed);
	},
};
