const Discord = require("discord.js");
const botconfig = require("../botconfig.json");

module.exports = {
	name: "use",
	description: "Use an item",
	aliases: ["useitem"],
	async execute(message, args, bot) {
		if (!args[0]) return message.channel.send("Specify what to use!");

		const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		if (["714", "715", "wiggenweld potion"].some(i => i.includes(args.join(" ")))) {
			if (userData.stats.fainted) return;

			if (userData.stats.health < 0) {
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, "stats.health");
				userData.stats.health = 0;
			}

			if (!userData.inventory.wiggenweldPotion || userData.inventory.wiggenweldPotion <= 0) return message.channel.send("You don't have any wiggenweld potions!");
			if (userData.stats.health >= userData.stats.maxHealth) return message.channel.send("You're already at your max health!");

			const healthToGive = (userData.stats.health + 48) > userData.stats.maxHealth ? userData.stats.maxHealth - userData.stats.health : 48;

			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", healthToGive, "stats.health");
			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.wiggenweldPotion");

			message.channel.send(healthToGive === 48 ? "You have recieved 48 health points." : "You have been fully healed.");
		} else if (["girding potion"].some(i => i.includes(args.join(" ")))) {
			if (!userData.inventory.girdingPotion || userData.inventory.girdingPotion <= 0) return message.channel.send("You don't have any girding potions!");

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.girdingPotion");
			bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.maxHealth");

			message.channel.send("You have used one girding potion.");
		} else if (["wideye potion"].some(i => i.includes(args.join(" ")))) {
			if (!userData.inventory.wideyePotion || userData.inventory.wideyePotion <= 0) return message.channel.send("You don't have any wideye potions!");

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.wideyePotion");
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, null, "cooldowns.lastStudy");

			message.channel.send("You have used one wideye potion.");
		} else if (["fire protection potion"].some(i => i.includes(args.join(" ")))) {
			if (!userData.inventory.fireProtectionPotion || userData.inventory.fireProtectionPotion <= 0) return message.channel.send("You don't have any fire protection potions!");

			if (userData.stats.activeEffects.some(e => e.type === "fire protection")) return message.channel.send("You have already used a fire protection potion!");

			const object = {
				time: Date.now(),
				type: "fire protection"
			};

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.fireProtectionPotion");
			bot.userInfo.push(`${message.guild.id}-${message.author.id}`, object, "stats.activeEffects");

			message.channel.send("You have used one fire protection potion. This will expire in one hour!");
		} else if (["strength potion"].some(i => i.includes(args.join(" ")))) {
			if (!userData.inventory.strengthPotion || userData.inventory.strengthPotion <= 0) return message.channel.send("You don't have any strength potions!");

			if (userData.stats.activeEffects.some(e => e.type === "strength")) return message.channel.send("You have already used a strength potion!");

			const object = {
				time: Date.now(),
				type: "strength"
			};

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.strengthPotion");
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 2, "stats.defense");
			bot.userInfo.push(`${message.guild.id}-${message.author.id}`, object, "stats.activeEffects");

			message.channel.send("You have used one strength potion. This will expire in two hours!");
		} else if (["felix felicis"].some(i => i.includes(args.join(" ")))) {
			if (!userData.inventory.felixFelicis || userData.inventory.felixFelicis <= 0) return message.channel.send("You don't have any felix felicis potions!");

			if (userData.stats.activeEffects.some(e => e.type === "luck")) return message.channel.send("You have already used a felix felicis potion!");

			const object = {
				time: Date.now(),
				type: "luck"
			};

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.felixFelicis");
			bot.userInfo.push(`${message.guild.id}-${message.author.id}`, object, "stats.activeEffects");

			message.channel.send("You have used one felix felicis potion. This will expire in one hour!");
		} else if (["wit-sharpening potion"].some(i => i.includes(args.join(" ")))) {
			if (!userData.inventory["wit-sharpeningPotion"] || userData.inventory["wit-sharpeningPotion"] <= 0) return message.channel.send("You don't have any wit-sharpening potions!");

			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 1000, "xp");

			message.channel.send("You have used one wit-sharpening potion.");
		} else if (["training token"].some(i => i.includes(args.join(" ")))) {
			message.delete();

			if (!userData.inventory.trainingTokens || userData.inventory.trainingTokens <= 0) return message.channel.send("You don't have any training tokens!").then(m => m.delete(5000));

			if (message.member.roles.find(r => r.name.toLowerCase() === "training")) return message.channel.send("You have already used a training token!").then(m => m.delete(5000));

			const role = message.guild.roles.find(r => r.name.toLowerCase() === "training");
			if (!role) return;

			message.member.addRole(role);

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.trainingTokens");
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, Date.now(), "trainingTokenUse");

			message.channel.send("You have used one training token. This will expire in one hour!").then(m => m.delete(5000));
		} else if (["maximum turbo farts"].some(i => args.join(" ").includes(i))) {
			if (!userData.inventory.maximumTurboFarts || userData.inventory.maximumTurboFarts <= 0) return message.channel.send("You don't have any maximum turbo fart potions!");

			const mentionedUser = bot.getUserFromMention(args[3], message.guild) || message.guild.members.get(args[3]);
			if (!mentionedUser) return message.channel.send("Specify the user use maximum turbo farts on!");

			const mentionedUserData = bot.userInfo.get(`${message.guild.id}-${mentionedUser.id}`);

			const object = {
				time: Date.now(),
				reactionsLeft: 30,
				type: "maximum turbo farts"
			};

			if (mentionedUserData.stats.activeEffects.find(i => i.reactionsLeft > 0)) {
				object.reactionsLeft += mentionedUserData.stats.activeEffects.find(i => i.reactionsLeft > 0).reactionsLeft;
				bot.userInfo.removeFrom(`${message.guild.id}-${mentionedUser.id}`, "stats.activeEffects", mentionedUserData.stats.activeEffects.find(i => i.reactionsLeft > 0));
			}

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.maximumTurboFarts");
			bot.userInfo.push(`${message.guild.id}-${mentionedUser.id}`, object, "stats.activeEffects");

			message.delete();
			message.author.send(`You have used a maximum turbo farts potion on ${mentionedUser.displayName}`);
		} else if (["stinksap"].some(i => args.join(" ").includes(i))) {
			if (!userData.inventory.vialOfStinksap || userData.inventory.vialOfStinksap <= 0) return message.channel.send("You don't have any stinksap!");

			const user = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]) || message.member;

			if (!bot.userInfo.hasProp(`${message.guild.id}-${user.id}`, "pet")) return message.channel.send(`${user.id === message.author.id ? "You don't have a pet!" : `${user.displayName} doesn't have a pet!`}`);

			bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.vialOfStinksap");
			bot.userInfo.set(`${message.guild.id}-${user.id}`, null, "pet.lastFeed");
			bot.userInfo.set(`${message.guild.id}-${user.id}`, false, "pet.fainted");

			message.channel.send(`You have revived ${user.id === message.author.id ? "your pet" : `${user.displayName}'s pet`}.`);
		}
	},
};
