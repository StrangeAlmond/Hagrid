const db = require("../utils/db.js");
const potions = require("../jsonFiles/potions.json");
const spells = require("../jsonFiles/spells.json");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "brew",
	description: "Brew a potion.",
	async execute(message, args, bot) {
		const webhookOptions = {
			username: "Severus Snape",
			avatar: "../images/webhook_avatars/severusSnape.jpg"
		};

		if (!args[0]) return bot.functions.quickWebhook(message.channel, "Specify a potion to brew.", webhookOptions);

		const userData = db.userInfo.get(message.author.key);

		const potion = potions.find(p => formatString(p.potion).toLowerCase().includes(args.join(" ")));
		if (!potion) return bot.functions.quickWebhook(message.channel, "Invalid Potion.", webhookOptions);

		const potionName = formatString(potion.potion);
		if (!userData.studiedSpells.includes(potionName.toLowerCase())) return bot.functions.quickWebhook(message.channel, "You haven't studied this potion.", webhookOptions);

		const ingredients = potion.ingredients;
		// Make sure they have the required ingredients for the potion.
		if (ingredients.some(i => !userData.inventory[i.split(/ +/)[1]] || userData.inventory[i.split(/ +/)[1]] < parseInt(i.split(/ +/)[0]))) {
			return bot.functions.quickWebhook(message.channel, "You don't have enough ingredients for this potion.", webhookOptions);
		}

		const brewChances = {
			"pewter": 50,
			"brass": 65,
			"copper": 80
		};

		let brewChance = brewChances[userData.cauldron] + (
			(userData.year - spells.find(s => s.spellName.toLowerCase() == potionName.toLowerCase()).yearRequired) * 2
		) + (userData.stats.luck);

		if (db.userInfo.get(message.author.key, "stats.activeEffects").some(e => e.type == "luck")) brewChance = 100;

		const chance = Math.floor(Math.random() * 100);

		ingredients.forEach(ingredient => {
			db.userInfo.math(message.author.key, "-", parseInt(ingredient.split(/ +/)[0]), `inventory.${ingredient.split(/ +/)[1]}`);
		});

		if (chance <= brewChance) {
			const successResponses = potion.successResponses;
			const successResponse = successResponses[Math.floor(Math.random() * successResponses.length)].replace(/{user}/g, message.member.displayName);

			bot.functions.quickWebhook(message.channel, successResponse, webhookOptions);

			if (!db.userInfo.has(message.author.key, `inventory.${potion.potion}`)) {
				db.userInfo.set(message.author.key, 0, `inventory.${potion.potion}`);
			}

			userData.stats.potionsMade++;
			db.userInfo.inc(message.author.key, `inventory.${potion.potion}`);
			db.userInfo.inc(message.author.key, "stats.potionsMade");

			switch (userData.stats.potionsMade) {
				case 1:
					db.userInfo.push(message.author.key, badges.find(i => i.name.toLowerCase() == "beginners luck badge").credential, "badges");
					setTimeout(() => {
						message.channel.send("You've recieved the beginner's luck badge for brewing your first potion!");
					}, 1000);
					break;

				case 3:
					db.userInfo.push(message.author.key, badges.find(i => i.name.toLowerCase() == "potions club star badge").credential, "badges");
					setTimeout(() => {
						message.channel.send("You've recieved the potions club star badge for brewing **3** potions!");
					}, 1000);
					break;

				case 50:
					db.userInfo.push(message.author.key, badges.find(i => i.name.toLowerCase() == "master potioneer bronze badge").credential, "badges");
					setTimeout(() => {
						message.channel.send("You've recieved the master potioneer bronze badge for brewing **50** potions!");
					}, 1000);
					break;

				case 200:
					db.userInfo.push(message.author.key, badges.find(i => i.name.toLowerCase() == "master potioneer silver badge").credential, "badges");
					setTimeout(() => {
						message.channel.send("You've recieved the master potioneer silver badge for brewing **200** potions!");
					}, 1000);
					break;

				case 500:
					db.userInfo.push(message.author.key, badges.find(i => i.name.toLowerCase() == "master potioneer gold badge").credential, "badges");
					setTimeout(() => {
						message.channel.send("You've recieved the master potioneer gold badge for brewing **500** potions!");
					}, 1000);
					break;
			}
			return;
		}

		const failResponses = potion.failResponses;
		const failResponse = failResponses[Math.floor(Math.random() * failResponses.length)].replace(/{user}/g, message.member.displayName);
		bot.functions.quickWebhook(message.channel, failResponse, webhookOptions);

		// Formats an ingredient name into a human-readable string
		function formatString(string) {
			const formatted = string.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
			const capitalized = formatted.replace(/\w\S*/g, str => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase());
			return capitalized;
		}
	},
};
