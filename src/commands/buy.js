const items = require("../jsonFiles/shop.json");

module.exports = {
	name: "buy",
	description: "Purchase an item.",
	aliases: ["purchase"],
	async execute(message, args, bot) {
		const stores = ["wand", "books", "clothes", "cauldron", "supplies"];

		if (stores.includes(args[0]) && !message.member.roles.cache.find(r => r.name.toLowerCase() == "unsorted")) return;
		if (stores.includes(args[0]) && message.member.roles.cache.find(r => r.name.toLowerCase() == "gringotts")) {
			return message.channel.send("❌ | You need to withdraw galleons from gringotts first!");
		}

		if (stores.includes(args[0])) {
			const roleNames = {
				wand: "ollivanders",
				books: "flourish and blotts",
				clothes: "madam malkins",
				cauldron: "potages",
				supplies: "wiseacres"
			};

			const messages = {
				wand: "Curious indeed how these things happen. The wand chooses the wizard, remember...I think we must expect great things from you, {author}",
				books: "This should get you started {author}. Copies of A Beginner's Guide to Transfiguration, A History of Magic, Fantastic Beasts and Where to Find Them, Magical Drafts and Potions, Magical Theory, One Thousand Magical Herbs and Fungi, The Dark Forces: A Guide to Self-Protection, and  of course The Standard Book of Spells, Grade One.",
				clothes: "This should cover you! Three plain black robes, one pointed hat, one pair gloves, and one fashionable winter cloak. Thank you for visiting Madam Malkin's Robes for All Occasions.",
				cauldron: "{author} You purchased a pewter cauldron, standard size 2. It should serve you well for all your beginner potion needs.",
				supplies: "Here you are {author}, 1 set of crystal phials, 1 set brass scales, and a telescope. Please make sure to visit us again for all your wizarding needs!"
			};

			const webhookOptions = {
				wand: {
					username: "Ollivanders",
					avatar: "../images/webhook_avatars/ollivanders.jpg"
				},

				books: {
					username: "Flourish and Blotts",
					avatar: "../images/webhook_avatars/flourishAndBlotts.png"
				},

				clothes: {
					username: "Madam Malkins",
					avatar: "../images/webhook_avatars/madamMalkins.png"
				},

				cauldron: {
					username: "Potages",
					avatar: "../images/webhook_avatars/potages.png"
				},

				supplies: {
					username: "Wiseacres",
					avatar: "../images/webhook_avatars/wiseacres.png"
				}
			};

			if (!message.member.roles.cache.some(r => r.name.toLowerCase() == roleNames[args[0]])) return;

			const shopName = roleNames[args[0]];
			const webhookMessage = messages[args[0]].replace("{author}", `${message.author}`);
			const webhookOption = webhookOptions[args[0]];

			const shopRole = message.guild.roles.cache.find(r => r.name.toLowerCase() == shopName);

			if (args[0] == "wand") {
				const wandRole = await message.guild.roles.cache.find(r => r.name.toLowerCase() == "wand");
				message.member.roles.add(wandRole);
			}

			bot.functions.quickWebhook(message.channel, webhookMessage, webhookOption);
			message.member.roles.remove(shopRole).catch(e => console.error(e));
		} else if ("apparition lessons".includes(args.join(" "))) {
			const user = bot.userInfo.get(message.author.key);
			if (user.year < 6) return;

			const apparitionRole = message.guild.roles.cache.find(r => r.name.toLowerCase() == "apparition");
			if (!apparitionRole) return;

			if (user.balance.galleons < 12) {
				return message.channel.send("You need 12 galleons to buy apparition lessons!");
			}

			bot.userInfo.math(message.author.key, "-", 12, "balance.galleons");
			message.member.roles.add(apparitionRole);
			message.channel.send("You have studied apparition lessons for 12 galleons!");
		} else {
			if (!items[args[0]]) return message.channel.send("Invalid Item!");

			const user = bot.userInfo.get(message.author.key);

			if (items[args[0]].name.toLowerCase().includes("cauldron")) {
				if (user.balance.galleons < items[args[0]].price) {
					return message.channel.send("You can't afford this item!");
				}

				if (user.cauldron != items[args[0]].requires) {
					return message.channel.send(`This cauldron requires you to have the ${items[args[0]].requires} cauldron before buying it`);
				}

				const price = parseInt(items[args[0]].price.split(/ +/)[0]);

				bot.userInfo.math(message.author.key, "-", price, "balance.galleons");
				bot.userInfo.set(message.author.key, items[args[0]].name.toLowerCase().split(/ +/)[0], "cauldron");
				bot.userInfo.inc(message.author.key, "stats.purchases");

				message.channel.send(`You have purchased a ${items[args[0]].name}`);
				bot.log(`${message.member.displayName} purchased a ${items[args[0]].name}`, "info");
			} else if (items[args[0]].type == "item") {
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

				price *= amount;

				if ((user.balance.sickles * 29) + (user.balance.galleons * 493) < price) {
					return message.channel.send("You can't afford this item.");
				}

				for (let i = 0; price > bot.userInfo.get(message.author.key, "balance.knuts"); i++) {
					if (bot.userInfo.get(message.author.key, "balance.sickles") <= 0 && bot.userInfo.get(message.author.key, "balance.galleons") > 0) {
						bot.userInfo.math(message.author.key, "+", 17, "balance.sickles");
						bot.userInfo.math(message.author.key, "-", 1, "balance.galleons");
					}

					bot.userInfo.dec(message.author.key, "balance.sickles");
					bot.userInfo.math(message.author.key, "+", 29, "balance.knuts");
				}

				if (!bot.userInfo.has(message.author.key, `inventory.${items[args[0]].key}`)) {
					bot.userInfo.set(message.author.key, 0, `inventory.${items[args[0]].key}`);
				}

				bot.userInfo.math(message.author.key, "-", price, "balance.knuts");
				bot.userInfo.math(message.author.key, "+", amount, "stats.purchases");

				message.channel.send(`You have purchased ${amount} ${items[args[0]].name}(s)`);

				if (items[args[0]].id == "1101") amount *= 6;
				if (items[args[0]].id == "705") amount *= 2;
				if (items[args[0]].id == "700") amount *= 10;
				if (items[args[0]].id == "714") amount *= 10;
				if (items[args[0]].id == "709") amount *= 10;
				if (items[args[0]].id == "712") amount *= 5;
				if (items[args[0]].id == "1000") amount *= 5;

				bot.userInfo.math(message.author.key, "+", amount, `inventory.${items[args[0]].key}`);
				bot.log(`${message.member.displayName} purchased ${amount} ${items[args[0]].name}(s)`, "info");
			} else if (items[args[0]].type == "pet") {
				const pets = user.pets.filter(p => !p.retired);
				const pet = pets[0];

				if (pet && (pet.level != 7 || pet.tier != 1)) {
					return message.channel.send("You already have a pet!");
				}

				if (!items[args[0]]) return message.channel.send("❌ | That's not a pet!");

				const petObject = items[args[0]];

				if (!pet && petObject.tier == 2) {
					return message.channel.send("You must first display you can take care of a pet by purchasing and taking care of a tier 1 pet!");
				}

				const price = parseInt(petObject.price.split(/ +/)[0]);

				if (pet && pet.level == 7 && petObject.tier == 1) {
					return message.channel.send("You can only purchase a tier 2 pet!");
				}

				if (bot.userInfo.get(message.author.key, "balance.galleons") < price) {
					return message.channel.send("You can't afford this pet!");
				}

				const genders = ["Male", "Female"];

				const object = {
					id: Date.now(),
					lastFeed: null,
					fainted: false,
					xp: 0,
					level: 1,
					pet: petObject.name,
					nickname: petObject.name,
					tier: petObject.tier,
					retired: false,
					gender: genders[Math.floor(Math.random() * genders.length)],
				};

				if (pet) pet.retired = true;
				user.pets.push(object);

				bot.userInfo.set(message.author.key, user.pets, "pets");
				bot.userInfo.math(message.author.key, "-", price, "balance.galleons");
				bot.userInfo.inc(message.author.key, "stats.purchases");

				message.channel.send(`Congratulations ${message.member.displayName}! You have purchased a ${petObject.name}! Make sure you use !pet feed every day to make sure your pet doesn't faint!`);
				bot.log(`${message.member.displayName} purchased a ${items[args[0]].name}`, "info");
			}
		}
	},
};
