const Discord = require("discord.js");
const potions = require("../jsonFiles/potions.json");
const spells = require("../jsonFiles/spells.json");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "brew",
	description: "Brew a potion.",
	async execute(message, args, bot) {
		// The webhook options object we'll use when sending a webhook as Severus Snape.
		const webhookOptions = {
			username: "Severus Snape",
			avatar: "./images/webhook_avatars/severusSnape.jpg"
		};

		// Make sure they specify a potion to brew.
		if (!args[0]) return bot.quickWebhook(message.channel, "Specify a potion to brew.", webhookOptions);

		// Get the user's db entry.
		const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		// Get the potion, and don't execute any further code if we can't find the potion.
		const potion = potions.find(p => formatString(p.potion).toLowerCase().includes(args.join(" ")));
		if (!potion) return bot.quickWebhook(message.channel, "Invalid Potion.", webhookOptions);

		// Get the name of the potion.
		const potionName = formatString(potion.potion);
		// If they haven't studied this potion yet don't let them brew it.
		if (!user.studiedSpells.includes(potionName.toLowerCase())) return bot.quickWebhook(message.channel, "You haven't studied this potion.", webhookOptions);

		// Get the ingredients of the potion.
		const ingredients = potion.ingredients;
		// Make sure they have the required ingredients for the potion.
		if (ingredients.some(i => !user.inventory[i.split(/ +/)[1]] || user.inventory[i.split(/ +/)[1]] < parseInt(i.split(/ +/)[0]))) return bot.quickWebhook(message.channel, "You don't have enough ingredients for this potion.", webhookOptions);

		// The brew chances for each cauldron type.
		const brewChances = {
			"pewter": 50,
			"brass": 65,
			"copper": 80
		};

		// Get their brew chance with a fancy math equation.
		let brewChance = brewChances[user.cauldron] + ((user.year - spells.find(s => s.spellName.toLowerCase() === potionName.toLowerCase()).yearRequired) * 2) + (user.stats.luck);

		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "stats.activeEffects").some(e => e.type == "luck")) brewChance = 100; // Brew chance is 100% if they've used a felix felicis potion

		// Generate a random number.
		const chance = Math.floor(Math.random() * 100);

		// For each ingredient in the potion
		ingredients.forEach(ingredient => {
			// Remove x amount of that ingredient from their inventory.
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", parseInt(ingredient.split(/ +/)[0]), `inventory.${ingredient.split(/ +/)[1]}`);
		});

		if (chance <= brewChance) { // If they've succesfully brewed the potion.
			// Get the success responses for the potion
			const successResponses = potion.successResponses;

			// Create an embed for displaying the success message.
			const successEmbed = new Discord.RichEmbed()
				.setColor("#4BB543")
				.setDescription(successResponses[Math.floor(Math.random() * successResponses.length)]);

			// Send the embed as Severus
			bot.quickWebhook(message.channel, successEmbed, webhookOptions);

			// If they don't have the potion in their inventory yet add it to their inventory.
			if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${potion.potion}`)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, `inventory.${potion.potion}`);

			// Give them 1 of the potion.
			bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, `inventory.${potion.potion}`);
			// Increase their potions made stat.
			bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.potionsMade");

			switch (user.stats.potionsMade) { // Switch statement for potions made amounts that prompt a badge.
				case 1: // If this is their first potion
					// Give them the beginners luck badge.
					bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badges.find(i => i.name.toLowerCase() === "beginners luck badge").credential, "badges");
					message.channel.send("You recieved the beginner's luck badge for brewing your first potion!");
					break;

				case 3: // If this is their third potion.
					// Give them the potions club star badge.
					bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badges.find(i => i.name.toLowerCase() === "potions club star badge").credential, "badges");
					message.channel.send("You recieved the potions club star badge for brewing **3** potions!");
					break;

				case 50: // If this is their fiftieth potion.
					// Give them the master potioneer bronze badge.
					bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badges.find(i => i.name.toLowerCase() === "master potioneer bronze badge").credential, "badges");
					message.channel.send("You recieved the master potioneer bronze badge for brewing **50** potions!");
					break;

				case 200: // If this is their two-hundredth potion.
					// Give them the master potioneer silver badge.
					bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badges.find(i => i.name.toLowerCase() === "master potioneer silver badge").credential, "badges");
					message.channel.send("You recieved the master potioneer silver badge for brewing **200** potions!");
					break;

				case 500: // If this is their five-hundredth potion.
					// Give them the master potioneer gold badge.
					bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badges.find(i => i.name.toLowerCase() === "master potioneer gold badge").credential, "badges");
					message.channel.send("You recieved the master potioneer gold badge for brewing **500** potions!");
					break;
			}

			// Don't execute the fail response.
			return;
		}

		// They've failed the brewing process

		// Grab the fail responses for this potion.
		const failResponses = potion.failResponses;

		// Send a random fail response from the list.
		bot.quickWebhook(message.channel, failResponses[Math.floor(Math.random() * failResponses.length)], webhookOptions);

		// Function to format an ingredient name
		function formatString(string) {
			const formatted = string.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
			const capitalized = formatted.replace(/\w\S*/g, str => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase());
			return capitalized;
		}
	},
};
