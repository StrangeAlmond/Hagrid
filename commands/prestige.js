const Discord = require("discord.js");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "prestige",
	description: "Prestige",
	async execute(message, args, bot) {
		if (message.author.id !== "356172624684122113" && message.author.id !== "137269251361865728") return;

		const user = bot.getUserFromMention(args[0], message.guild);
		if (!user) return message.channel.send(`Specify the user to prestige! Proper Usage: \`${bot.prefix}prestige <@member> <type>\``);

		const userData = bot.userInfo.get(`${message.guild.id}-${user.id}`);

		const items = ["elder wand", "invisibility cloak", "resurrection stone"];
		const prestigeItem = items.find(i => args.slice(1).join(" ") === i);

		if (!prestigeItem) return message.channel.send(`Specify the item to give the user! Proper Usage: \`${bot.prefix}prestige <@member< <type>\``);

		const formattedPrestigeItem = bot.toCamelCase(prestigeItem);

		if (userData.inventory[formattedPrestigeItem] >= 1) return message.channel.send(`They have already have the ${prestigeItem}!`);

		const yearSevenRole = user.roles.find(r => r.name.toLowerCase() === "seventh year");
		if (yearSevenRole) user.removeRole(yearSevenRole);

		const yearOneRole = message.guild.roles.find(r => r.name.toLowerCase() === "first year");
		user.addRole(yearOneRole);

		const studiedSpells = userData.studiedSpells.filter(s => user.roles.some(r => r.name.toLowerCase() === s));
		studiedSpells.forEach(spell => {
			const role = message.guild.roles.find(r => r.name.toLowerCase() === spell);
			user.removeRole(role);
		});

		const valuesToReset = {
			"xp": 0,
			"year": 1,
			"stats.attack": 1,
			"stats.defense": 1,
			"stats.maxHealth": 48,
			"stats.health": 48,
			"pet.level": 1,
			"balance.galleons": 0,
			"balance.sickles": 0,
			"balance.knuts": 0,
			"cooldowns.lastDaily": null,
			"cooldowns.lastMerit": null,
			"cooldowns.lastStudy": null,
			"cooldowns.lastResurrectionStoneUser": null,
			"mazeInfo.dailyForagesLeft": 100,
			"inventory": {},
			"cauldron": "pewter",
			"stats.prestiges": userData.stats.prestiges + 1,
			"studiedSpells": []
		};

		for (let [key, value] of Object.entries(valuesToReset)) {
			bot.userInfo.set(`${message.guild.id}-${user.id}`, value, key);
		}

		const prestigeItems = Object.keys(userData.inventory).filter(item => items.map(i => bot.toCamelCase(i)).includes(item));
		prestigeItems.forEach(item => {
			bot.userInfo.set(`${message.guild.id}-${user.id}`, 1, `inventory.${item}`);
		});

		if (prestigeItem === "elder wand") elderWand();
		if (prestigeItem === "invisibility cloak") invisibilityCloak();
		if (prestigeItem === "resurrection stone") resurrectionStone();

		if (userData.inventory.resurrectionStone >= 1 && userData.inventory.invisibilityCloak >= 1 && userData.inventory.elderWand >= 1) {
			const badge = badges.badgesArray.find(b => b.name.toLowerCase() === "deathly ballows badge");
			bot.userInfo.push(`${message.guild.id}-${user.id}`, badge.credential, "badges");
		}

		message.channel.send(`${user} has prestiged and been given the ${prestigeItem}!`);

		function elderWand() {
			bot.userInfo.math(`${message.guild.id}-${user.id}`, "+", 2, "stats.attack");

			const elderWandInfo = {
				wood: "Elder",
				core: "Thestral tail-hair",
				length: "15",
				flexibility: "Unyielding"
			};

			bot.userInfo.set(`${message.guild.id}-${user.id}`, elderWandInfo, "wand");
			bot.userInfo.set(`${message.guild.id}-${user.id}`, 1, "inventory.elderWand");
		}

		function invisibilityCloak() {
			bot.userInfo.set(`${message.guild.id}-${user.id}`, 1, "inventory.invisibilityCloak");
		}

		function resurrectionStone() {
			bot.userInfo.set(`${message.guild.id}-${user.id}`, 1, "inventory.resurrectionStone");
			bot.userInfo.set(`${message.guild.id}-${user.id}`, null, "cooldowns.lastResurrectionStoneUse");
		}
	},
};
