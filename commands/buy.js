const Discord = require("discord.js");
const items = require("../jsonFiles/shop.json");

module.exports = {
	name: "buy",
	description: "Buy an item",
	aliases: ["purchase"],
	async execute(message, args, bot) {

		const stores = ["wand", "books", "clothes", "cauldron", "supplies"];

		if (stores.includes(args[0]) && !message.member.roles.find(r => r.name === "Unsorted")) return;
		if (stores.includes(args[0]) && message.member.roles.find(r => r.name == "Gringotts")) return message.channel.send("❌ | You need to withdraw galleons from gringotts first!");

		if (args[0] === "wand") {
			// Make sure they can buy a wand
			if (!message.member.roles.find(r => r.name.toLowerCase() === "wiseacres")) return;

			await bot.quickWebhook(message.channel, `Curious indeed how these things happen. The wand chooses the wizard, remember...I think we must expect great things from you, ${message.author}`, {
				username: "Ollivanders",
				avatar: "http://www.the-leaky-cauldron.org/wp-content/uploads/assets/65a68ab93cab1bfda806f9a2b9e04bf6.jpg",
				deleteAfterUse: true
			});

			// Find these two roles
			const ollivanderRole = await message.guild.roles.find(r => r.name.toLowerCase() === "ollivanders");
			const wandRole = await message.guild.roles.find(r => r.name.toLowerCase() === "wand");

			// Remove the ollivander role and give them the wand role
			await message.member.removeRole(ollivanderRole);
			await message.member.addRole(wandRole);

		} else if (args[0] === "books") {
			// Make sure they can buy a book
			if (!message.member.roles.find(r => r.name.toLowerCase() === "flourish and blotts")) return;

			const flourishAndBlottsRole = await message.guild.roles.find(r => r.name.toLowerCase() === "wiseacres");
			await bot.quickWebhook(message.channel, `This should get you started ${message.author}. Copies of A Beginner's Guide to Transfiguration, A History of Magic, Fantastic Beasts and Where to Find Them, Magical Drafts and Potions, Magical Theory, One Thousand Magical Herbs and Fungi, The Dark Forces: A Guide to Self-Protection, and  of course The Standard Book of Spells, Grade One.`, {
				username: "Flourish and Blotts",
				avatar: "https://i.pinimg.com/originals/9a/96/87/9a9687faa57829154c395b260fae2f60.png",
				deleteAfterUse: true
			});

			message.member.removeRole(flourishAndBlottsRole);
		} else if (args[0] === "clothes") {
			if (!message.member.roles.find(r => r.name.toLowerCase() === "madam malkins")) return;

			const madamMalkinsRole = await message.guild.roles.find(r => r.name.toLowerCase() === "wiseacres");
			await bot.quickWebhook(message.channel, "This should cover you! Three plain black robes, one pointed hat, one pair gloves, and one fashionable winter cloak. Thank you for visiting Madam Malkin's Robes for All Occasions.", {
				username: "Madam Malkins",
				avatar: "http://t4.rbxcdn.com/51c51b55e778c6d3e140898631a61e03"
			});

			message.member.removeRole(madamMalkinsRole);
		} else if (args[0] === "cauldron") {
			if (!message.member.roles.find(r => r.name.toLowerCase() === "potages")) return;

			const potages = await message.guild.roles.find(r => r.name.toLowerCase() === "wiseacres");
			await bot.quickWebhook(message.channel, `${message.author} You purchased a pewter cauldron, standard size 2. It should serve you well for all your beginner potion needs.`, {
				username: "Potages",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/9/97/Potage%27s_hoarding.png/revision/latest?cb=20120404181518",
				deleteAfterUse: true
			});

			message.member.removeRole(potages);
		} else if (args[0] === "supplies") {
			if (!message.member.roles.find(r => r.name.toLowerCase() === "wiseacres")) return;

			const wiseacresRole = await message.guild.roles.find(r => r.name.toLowerCase() === "wiseacres");
			await bot.quickWebhook(message.channel, `Here you are ${message.author}, 1 set of crystal phials, 1 set brass scales, and a telescope. Please make sure to visit us again for all your wizarding needs!`, {
				username: "Wiseacres",
				avatar: "https://i.imgur.com/Q3d3Yna.png",
				deleteAfterUse: true
			});

			message.member.removeRole(wiseacresRole);
		} else if (args[0] === "900") {
			const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

			const role = message.guild.roles.find(r => r.name.toLowerCase() === "apparition");
			if (!role) return;

			const sickles = userData.balance.sickles;
			const galleons = userData.balance.galleons;

			if (sickles < 2 && galleons > 0) {
				bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "balance.galleons");
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 17, "balance.sickles");
			} else if (sickles < 2 && galleons <= 0) {
				return message.channel.send("You can't afford floo powder!");
			}

			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 2, "balance.sickles");

			message.member.addRole(role);

			const object = {
				time: Date.now(),
				type: "floo powder"
			};

			bot.userInfo.push(`${message.guild.id}-${message.author.id}`, object, "stats.activeEffects");

			message.channel.send("You have bought floo powder!");
		} else if ("apparition lessons".includes(args.join(" "))) {
			const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
			if (user.year < 6) return;

			const apparitionRole = message.guild.roles.find(r => r.name.toLowerCase() === "apparition");
			if (!apparitionRole) return;

			if (user.balance.galleons < 12) return message.channel.send("You need 12 galleons to buy apparition lessons!");

			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 12, "balance.galleons");
			message.member.addRole(apparitionRole);
			message.channel.send("You have studied apparition lessons for 12 galleons!");
		} else {
			if (!items[args[0]]) return message.channel.send("Invalid Item!");

			if (items[args[0]].name.toLowerCase().includes("cauldron")) {
				const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

				if (user.balance.galleons < items[args[0]].price) return message.channel.send("You can't afford this item!");
				if (user.cauldron !== items[args[0]].requires) return message.channel.send(`This cauldron requires you to have the ${items[args[0]].requires} cauldron before buying it`);

				const price = parseInt(items[args[0]].price.split(/ +/)[0]);

				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.galleons");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, items[args[0]].name.toLowerCase().split(/ +/)[0], "cauldron");
				bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.purchases");

				message.channel.send(`You have purchased a ${items[args[0]].name}`);
				bot.logger.log("info", `${message.member.displayName} purchased a ${items[args[0]].name}`);
			} else if (items[args[0]].type === "item") {
				let amount = 1;

				if (args[1] && !isNaN(args[1])) {
					amount = parseInt(args[1]);
				}

				let price = 0;

				const priceArray = items[args[0]].price.split(/, +/);
				priceArray.forEach(p => {
					p = p.split(/ +/);
					if (p[1].startsWith("galleon")) {
						price += (parseInt(p[0]) * 493);
					} else if (p[1].startsWith("sickle")) {
						price += (parseInt(p[0]) * 29);
					} else if (p[1].startsWith("knut")) {
						price += parseInt(p[0]);
					}
				});

				price = price * amount;

				const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

				if ((user.balance.sickles * 29) + (user.balance.galleons * 493) < price) return message.channel.send("You can't afford this item.");

				for (let i = 0; price > bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.knuts"); i++) {
					if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.sickles") <= 0 && bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.galleons") > 0) {
						bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 17, "balance.sickles");
						bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 1, "balance.galleons");
					}

					bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "balance.sickles");
					bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 29, "balance.knuts");
				}

				// Ensure they have the key in their inventory
				if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${items[args[0]].key}`)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, `inventory.${items[args[0]].key}`);

				// Take away the price amount
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.knuts");
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, "stats.purchases");

				if (items[args[0]].name === "1002") amount = amount * 6;
				if (items[args[0]].id === "705") amount = amount * 2;
				if (items[args[0]].id === "700") amount = amount * 10;
				if (items[args[0]].id === "714") amount = amount * 10;
				if (items[args[0]].id === "709") amount = amount * 10;
				if (items[args[0]].id === "712") amount = amount * 5;
				if (items[args[0]].name === "1102") amount = amount * 5;

				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, `inventory.${items[args[0]].key}`);
				message.channel.send(`You have purchased ${amount} ${items[args[0]].name}(s)`);
				bot.logger.log("info", `${message.member.displayName} purchased ${amount} ${items[args[0]].name}(s)`);
			} else if (items[args[0]].type === "pet") {
				if (bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, "petInfo")) return message.channel.send("You already have a pet!");

				if (!items[args[0]]) return message.channel.send("❌ | That's not a pet!");
				const pet = items[args[0]];
				const price = parseInt(items[args[0]].price.split(/ +/)[0]);

				if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.galleons") < price) return message.channel.send("You can't afford this pet!");

				const genders = ["Male", "Female"];

				const petObject = {
					lastFeed: null,
					fainted: false,
					image: pet.image,
					xp: 0,
					level: 1,
					pet: pet.name,
					nickname: pet.name,
					gender: genders[Math.floor(Math.random() * genders.length)]
				};

				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, petObject, "petInfo");
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.galleons");
				bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.purchases");

				message.channel.send(`Congratulations ${message.member.displayName}! You have purchased a ${pet.name}! Make sure you use !pet feed every day to make sure your pet doesn't faint!`);
				bot.logger.log("info", `${message.member.displayName} purchased a ${items[args[0]].name}`);
			}
		}
	},
};
