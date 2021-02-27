const db = require("../utils/db.js");

module.exports = {
	name: "use",
	description: "Use an item",
	aliases: ["useitem"],
	async execute(message, args, bot) {
		if (!args[0]) return message.channel.send("Specify what to use!");

		const items = [
			"714",
			"715",
			"wiggenweld potion",
			"girding potion",
			"wideye potion",
			"fire protection potion",
			"strength potion",
			"exstimulo potion",
			"felix felicis",
			"wit-sharpening potion",
			"training token",
			"maximum turbo farts",
			"stinksap",
			"floo powder"
		];

		const item = items.find(i => i.includes(args.join(" ")) || args.join(" ").includes(i));
		const userData = db.userInfo.get(message.author.key);

		if (["714", "715", "wiggenweld potion"].includes(item)) {
			if (userData.stats.fainted) return;

			if (userData.stats.health < 0) {
				db.userInfo.set(message.author.key, 0, "stats.health");
				userData.stats.health = 0;
			}

			if (!hasItem("wiggenweldPotion")) {
				return message.channel.send("You don't have any wiggenweld potions!");
			}

			if (userData.stats.health >= userData.stats.maxHealth) {
				return message.channel.send("You're already at your max health!");
			}

			const healthToGive = (userData.stats.health + 48) > userData.stats.maxHealth ? userData.stats.maxHealth - userData.stats.health : 48;

			db.userInfo.math(message.author.key, "+", healthToGive, "stats.health");
			userData.stats.health += healthToGive;
			db.userInfo.dec(message.author.key, "inventory.wiggenweldPotion");

			message.channel.send(healthToGive == 48 ?
				`+48 HP! You now have ${userData.stats.health}/${userData.stats.maxHealth} HP.` :
				`You've been fully healed! You now have ${userData.stats.health}/${userData.stats.maxHealth} HP.`);

		} else if (item == "girding potion") {
			if (!hasItem("girdingPotion")) {
				return message.channel.send("You don't have any girding potions!");
			}

			db.userInfo.dec(message.author.key, "inventory.girdingPotion");
			db.userInfo.inc(message.author.key, "stats.maxHealth");

			message.channel.send("You have used one girding potion.");
		} else if (item == "wideye potion") {
			if (!hasItem("wideyePotion")) {
				return message.channel.send("You don't have any wideye potions!");
			}

			db.userInfo.dec(message.author.key, "inventory.wideyePotion");
			db.userInfo.set(message.author.key, null, "cooldowns.lastStudy");

			message.channel.send("You have used one wideye potion.");
		} else if (item == "fire protection potion") {
			if (!hasItem("fireProtectionPotion")) {
				return message.channel.send("You don't have any fire protection potions!");
			}

			if (userData.stats.activeEffects.some(e => e.type == "fire protection")) {
				return message.channel.send("You have already used a fire protection potion!");
			}

			const object = {
				time: Date.now(),
				type: "fire protection"
			};

			db.userInfo.dec(message.author.key, "inventory.fireProtectionPotion");
			db.userInfo.push(message.author.key, object, "stats.activeEffects");

			message.channel.send("You have used one fire protection potion. This will expire in one hour!");
		} else if (item == "strength potion") {
			if (!hasItem("strengthPotion")) {
				return message.channel.send("You don't have any strength potions!");
			}

			if (userData.stats.activeEffects.some(e => e.type == "strength")) {
				return message.channel.send("You have already used a strength potion!");
			}

			const object = {
				time: Date.now(),
				type: "strength"
			};

			db.userInfo.dec(message.author.key, "inventory.strengthPotion");
			db.userInfo.math(message.author.key, "+", 2, "stats.defense");
			db.userInfo.push(message.author.key, object, "stats.activeEffects");

			message.channel.send("You have used one strength potion. This will expire in two hours!");
		} else if (item == "exstimulo potion") {
			if (!hasItem("strengthPotion")) {
				return message.channel.send("You don't have any strength potions!");
			}

			if (userData.stats.activeEffects.some(e => e.type == "exstimulo")) {
				return message.channel.send("You have already used an exstimulo potion!");
			}

			const object = {
				time: Date.now(),
				type: "exstimulo"
			};

			db.userInfo.dec(message.author.key, "inventory.strengthPotion");
			db.userInfo.math(message.author.key, "+", 2, "stats.attack");
			db.userInfo.push(message.author.key, object, "stats.activeEffects");

			message.channel.send("You have used one exstimulo potion. This will expire in two hours!");
		} else if (item == "felix felicis") {
			if (!hasItem("felixFelicis")) {
				return message.channel.send("You don't have any felix felicis potions!");
			}

			if (userData.stats.activeEffects.some(e => e.type == "luck")) {
				return message.channel.send("You have already used a felix felicis potion!");
			}

			const object = {
				time: Date.now(),
				type: "luck"
			};

			db.userInfo.dec(message.author.key, "inventory.felixFelicis");
			db.userInfo.push(message.author.key, object, "stats.activeEffects");

			message.channel.send("You have used one felix felicis potion. This will expire in one hour!");
		} else if (item == "wit-sharpening potion") {
			if (!hasItem("wit-sharpeningPotion")) {
				return message.channel.send("You don't have any wit-sharpening potions!");
			}

			db.userInfo.math(message.author.key, "+", 1000, "xp");
			db.userInfo.dec(message.author.key, "inventory.wit-sharpeningPotion");

			message.channel.send("You have used one wit-sharpening potion.");
		} else if (item == "training token") {
			message.delete();

			if (!hasItem("trainingTokens")) {
				return message.channel.send("You don't have any training tokens!").then(m => m.delete(5000));
			}

			if (message.member.roles.cache.find(r => r.name.toLowerCase() == "training")) {
				return message.channel.send("You have already used a training token!").then(m => {
					m.delete({ timeout: 5000 });
				});
			}

			const role = message.guild.roles.cache.find(r => r.name.toLowerCase() == "training");
			if (!role) return;

			message.member.roles.add(role);

			db.userInfo.dec(message.author.key, "inventory.trainingTokens");
			db.userInfo.set(message.author.key, Date.now(), "trainingTokenUse");

			message.channel.send("You have used one training token. This will expire in one hour!").then(m => {
				m.delete({ timeout: 5000 });
			});
		} else if (item == "maximum turbo farts") {
			if (!hasItem("maximumTurboFarts")) {
				return message.channel.send("You don't have any maximum turbo fart potions!");
			}

			const mentionedUser = bot.functions.getUserFromMention(args[3], message.guild) || message.guild.members.cache.get(args[3]);
			if (!mentionedUser) return message.channel.send("Specify the user use maximum turbo farts on!");

			const mentionedUserData = db.userInfo.get(`${message.guild.id}-${mentionedUser.id}`);

			const object = {
				time: Date.now(),
				reactionsLeft: 30,
				type: "maximum turbo farts"
			};

			if (mentionedUserData.stats.activeEffects.find(i => i.reactionsLeft > 0)) {
				object.reactionsLeft += mentionedUserData.stats.activeEffects.find(i => i.reactionsLeft > 0).reactionsLeft;
				db.userInfo.remove(`${message.guild.id}-${mentionedUser.id}`, (i) => i.reactionsLeft > 0, "stats.activeEffects");
			}

			db.userInfo.dec(message.author.key, "inventory.maximumTurboFarts");
			db.userInfo.inc(message.author.key, "stats.pranks");
			db.userInfo.push(`${message.guild.id}-${mentionedUser.id}`, object, "stats.activeEffects");

			message.delete();
			message.author.send(`You have used a maximum turbo farts potion on ${mentionedUser.displayName}`);
		} else if (item == "stinksap") {
			if (!hasItem("vialOfStinksap")) {
				return message.channel.send("You don't have any stinksap!");
			}

			const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
			const userObject = db.userInfo.get(`${message.guild.id}-${user.id}`);

			const pets = userObject.pets.filter(p => !p.retired);
			const pet = pets[0];

			if (!pet) {
				return message.channel.send(`${user.id == message.author.id ? "You don't " : `${user.displayName} does not `} have a pet to revive!`);
			}

			db.userInfo.dec(message.author.key, "inventory.vialOfStinksap");

			pet.lastFeed = null;
			pet.fainted = false;

			userObject.pets.splice(userObject.pets.findIndex(p => p.id == pet.id), 1, pet);

			db.userInfo.set(`${message.guild.id}-${user.id}`, userObject.pets, "pets");

			message.channel.send(`You have revived ${user.id == message.author.id ? "your pet" : `${user.displayName}'s pet`}.`);
		} else if (item == "floo powder") {
			if (!hasItem("flooPowder")) return message.channel.send("You don't have any floo powder!");
			const role = message.guild.roles.cache.find(r => r.name.toLowerCase() == "apparition");
			if (!role) return;
			if (message.member.roles.cache.get(role.id)) return message.channel.send("You have already used floo powder!");

			message.member.roles.add(role).catch(console.error);

			const object = {
				time: Date.now(),
				type: "floo powder"
			};

			db.userInfo.dec(message.author.key, "inventory.flooPowder");
			db.userInfo.push(message.author.key, object, "stats.activeEffects");
			message.channel.send("You have used floo powder and now have access to Knockturn Alley. Your access will expire in one hour.");
		}

		function hasItem(i) {
			if (!userData.inventory[i] || userData.inventory[i] <= 0) return false;
			return true;
		}
	},
};
