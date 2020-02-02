const Discord = require("discord.js");
const items = require("../jsonFiles/shop.json");

module.exports = {
	name: "buy",
	description: "Purchase an item.",
	aliases: ["purchase"],
	async execute(message, args, bot) {
		// Stores in diagon alley
		const stores = ["wand", "books", "clothes", "cauldron", "supplies"];

		// If they don't have access to diagon alley don't let them shop at diagon alley
		if (stores.includes(args[0]) && !message.member.roles.find(r => r.name.toLowerCase() === "unsorted")) return;
		// If they still need to withdraw galleons from gringotts don't let them shop at diagon alley yet.
		if (stores.includes(args[0]) && message.member.roles.find(r => r.name.toLowerCase() == "gringotts")) return message.channel.send("❌ | You need to withdraw galleons from gringotts first!");

		if (["wand", "books", "clothes", "cauldron", "supplies"].includes(args[0])) { // The five item to buy in Diagon Alley
			const roleNames = { // Role/Store names for the corresponding item
				wand: "ollivandekrs",
				books: "flourish and blotts",
				clothes: "madam malkins",
				cauldron: "potages",
				supplies: "wiseacres"
			};

			const messages = { // Unique store messages based on the item being bought
				wand: "Curious indeed how these things happen. The wand chooses the wizard, remember...I think we must expect great things from you, {author}",
				books: "This should get you started {author}. Copies of A Beginner's Guide to Transfiguration, A History of Magic, Fantastic Beasts and Where to Find Them, Magical Drafts and Potions, Magical Theory, One Thousand Magical Herbs and Fungi, The Dark Forces: A Guide to Self-Protection, and  of course The Standard Book of Spells, Grade One.",
				clothes: "This should cover you! Three plain black robes, one pointed hat, one pair gloves, and one fashionable winter cloak. Thank you for visiting Madam Malkin's Robes for All Occasions.",
				cauldron: "{author} You purchased a pewter cauldron, standard size 2. It should serve you well for all your beginner potion needs.",
				supplies: "Here you are {author}, 1 set of crystal phials, 1 set brass scales, and a telescope. Please make sure to visit us again for all your wizarding needs!"
			};

			const webhookOptions = { // Unique webhook options based on the item being bought
				wand: {
					username: "Ollivanders",
					avatar: "./images/webhook_avatars/ollivanders.jpg"
				},

				books: {
					username: "Flourish and Blotts",
					avatar: "./images/webhook_avatars/flourishAndBlotts.png"
				},

				clothes: {
					username: "Madam Malkins",
					avatar: "./images/webhook_avatars/madamMalkins.png"
				},

				cauldron: {
					username: "Potages",
					avatar: "./images/webhook_avatars/potages.png"
				},

				supplies: {
					username: "Wiseacres",
					avatar: "./images/webhook_avatars/wiseacres.png"
				}
			};

			const shopName = roleNames[args[0]]; // Name of the shop
			const webhookMessage = messages[args[0]].replace("{author}", `${message.author}`); // Get the unique message for the item being bought and replace any instance of '${author}' with the user's user object
			const webhookOption = webhookOptions[args[0]]; // Get the unique webhook options for the store that the item's being bought from

			const shopRole = message.guild.roles.find(r => r.name.toLowerCase() === shopName); // Get the role for the shop

			if (args[0] === "wand") { // If they're buying a wand then we need to give them the 'wand' role.
				const wandRole = await message.guild.roles.find(r => r.name.toLowerCase() === "wand"); // Get the wand role
				message.member.addRole(wandRole); // Give it to the user
			}

			// Send the webhook message
			await bot.quickWebhook(message.channel, webhookMessage, webhookOption);

			// Wait 1.5 seconds before removing their role to give time to read the message
			setTimeout(() => {
				message.member.removeRole(shopRole);
			}, 1500);
		} else if (args[0] === "900") {
			// If they're buying floo powder
			const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

			// Get the apparition role
			const role = message.guild.roles.find(r => r.name.toLowerCase() === "apparition");
			if (!role) return; // If the apparition role can't be found then don't execute any further code

			// Get the user's sickles and galleons
			const sickles = userData.balance.sickles;
			const galleons = userData.balance.galleons;

			// if they have (< 2) sickles but (> 0) galleons then convert a galleon to 17 sickles
			if (sickles < 2 && galleons > 0) {
				bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "balance.galleons");
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 17, "balance.sickles");
			} else if (sickles < 2 && galleons <= 0) { // Otherwise if they're just plain broke don't give them the apparition role
				return message.channel.send("You can't afford floo powder!");
			}

			// Remove 2 sickles from the user's balance
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 2, "balance.sickles");

			// Give the user the apparition role
			message.member.addRole(role);

			// Create an object with the current timestamp and the effect type
			const object = {
				time: Date.now(),
				type: "floo powder"
			};

			// Push it into the user's active effects
			bot.userInfo.push(`${message.guild.id}-${message.author.id}`, object, "stats.activeEffects");

			// Let them know everything worked
			message.channel.send("You have bought floo powder!");
		} else if ("apparition lessons".includes(args.join(" "))) { // If they're purchasing apparition lessons
			// Get the user's object
			const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
			// Make sure they're year 6 or above
			if (user.year < 6) return;

			// Grab the apparition role
			const apparitionRole = message.guild.roles.find(r => r.name.toLowerCase() === "apparition");
			if (!apparitionRole) return; // If the apparition role can't be found don't execute any further code.

			// Make sure they have at least 12 galleons
			if (user.balance.galleons < 12) return message.channel.send("You need 12 galleons to buy apparition lessons!");

			// Take away 12 galleons from the user's balance
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 12, "balance.galleons");
			// Give the user the apparition role
			message.member.addRole(apparitionRole);
			// Let them know everything worked
			message.channel.send("You have studied apparition lessons for 12 galleons!");
		} else { // Otherwise if they're buying a shop item
			// Make sure it's an actual item
			if (!items[args[0]]) return message.channel.send("Invalid Item!");

			// Get the user object
			const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

			// If they're purchasing a new cauldron
			if (items[args[0]].name.toLowerCase().includes("cauldron")) {
				// Make sure they have enough money
				if (user.balance.galleons < items[args[0]].price) return message.channel.send("You can't afford this item!");
				// Make sure they have the required cauldron tier
				if (user.cauldron !== items[args[0]].requires) return message.channel.send(`This cauldron requires you to have the ${items[args[0]].requires} cauldron before buying it`);

				// Get the price of the cauldron
				const price = parseInt(items[args[0]].price.split(/ +/)[0]);

				// Remove x amount of galleons from their balance
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.galleons");
				// Give them their new cauldron
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, items[args[0]].name.toLowerCase().split(/ +/)[0], "cauldron");
				// Add 1 to their purchases stat
				bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.purchases");

				// Let them know it worked
				message.channel.send(`You have purchased a ${items[args[0]].name}`);
				// Log that they purchased a new cauldron
				bot.log(`${message.member.displayName} purchased a ${items[args[0]].name}`, "info");
			} else if (items[args[0]].type === "item") {
				// Default amount value
				let amount = 1;

				// If they specify a different amount then set the new amount value
				if (args[1] && !isNaN(args[1])) {
					amount = parseInt(args[1]);
				}

				// Set the price to 0 for now
				let price = 0;

				// Get the price array
				const priceArray = items[args[0]].price.split(/, +/);
				// For each value in the price array
				priceArray.forEach(p => {
					p = p.split(/ +/); // Seperate each word into an array
					if (p[1].startsWith("galleon")) { // If galleons are being used
						// Add 493 knuts to the price
						price += (parseInt(p[0]) * 493);
					} else if (p[1].startsWith("sickle")) { // If sickles are being used
						// Add 29 knuts to the price
						price += (parseInt(p[0]) * 29);
					} else if (p[1].startsWith("knut")) { // If knuts are being used
						// Add x amount of knuts to the price
						price += parseInt(p[0]);
					}
				});

				// Multiply the price to match the amount
				price = price * amount;

				// Make sure they can afford the item
				if ((user.balance.sickles * 29) + (user.balance.galleons * 493) < price) return message.channel.send("You can't afford this item.");

				// Convert their money to sickles until they can afford the price
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

				// Take away the price amount from their balance
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.knuts");
				// Increase their purchases stat by the amount value
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, "stats.purchases");

				// Send a message saying they purchased it
				message.channel.send(`You have purchased ${amount} ${items[args[0]].name}(s)`);

				if (items[args[0]].id === "1002") amount = amount * 6;
				if (items[args[0]].id === "705") amount = amount * 2;
				if (items[args[0]].id === "700") amount = amount * 10;
				if (items[args[0]].id === "714") amount = amount * 10;
				if (items[args[0]].id === "709") amount = amount * 10;
				if (items[args[0]].id === "712") amount = amount * 5;
				if (items[args[0]].id === "1102") amount = amount * 5;

				// Give them the item they purchased
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, `inventory.${items[args[0]].key}`);
				// Log to the console what they bought and how much
				bot.log(`${message.member.displayName} purchased ${amount} ${items[args[0]].name}(s)`, "info");
			} else if (items[args[0]].type === "pet") { // If they're buying a pet
				// Make sure they don't already have a pet
				if (bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, "pet")) return message.channel.send("You already have a pet!");

				// Make sure they're using the proper id id for a pet
				if (!items[args[0]]) return message.channel.send("❌ | That's not a pet!");

				// Get the pet object
				const pet = items[args[0]];
				// Get the pet's price.
				const price = parseInt(items[args[0]].price.split(/ +/)[0]);

				// Make sure they can afford it
				if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.galleons") < price) return message.channel.send("You can't afford this pet!");

				// Available genders to choose from (Note: any other genders requested shall be changed manually.)
				const genders = ["Male", "Female"];

				// Create an object for the pet
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

				// Set the user's pet value to the object
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, petObject, "pet");
				// Take away the amount of galleons it cost
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.galleons");
				// Increase their purchases stat
				bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.purchases");

				// Send a message saying it worked
				message.channel.send(`Congratulations ${message.member.displayName}! You have purchased a ${pet.name}! Make sure you use !pet feed every day to make sure your pet doesn't faint!`);
				// Log that they bought a pet to the console
				bot.log(`${message.member.displayName} purchased a ${items[args[0]].name}`, "info");
			}
		}
	},
};
