const fs = require("fs");
const Discord = require("discord.js");
const encountersFile = require("../jsonFiles/forbidden_forest/encounters.json");
const ambushesFile = require("../jsonFiles/forbidden_forest/ambushes.json");
const itemsFile = require("../jsonFiles/forbidden_forest/items.json");
const darkWizardItems = require("../jsonFiles/forbidden_forest/darkWizardItems.json");

const firstLevelPos = "34.12";
const secondLevelPos = "33.12";

const centaurWebhookInfo = {
	username: "Centaur",
	avatar: "https://i.imgur.com/z4n0Jcf.jpg"
};

const darkWizardWebhookInfo = {
	username: "Dark Wizard",
	avatar: "https://i.imgur.com/oXahnDf.png"
};

const movements = {
	up: -1,
	down: 1,
	left: -0.01,
	right: 0.01
};

class ForbiddenForest {
	constructor(bot, channel, curPos, lastPos, level, encounterLocations, ambushLocations, itemLocations, guildId, userId, member, webhook) {
		this.bot = bot;
		this.channel = channel;
		this.curPos = curPos;
		this.lastPos = lastPos;
		this.level = level;
		this.encounterLocations = encounterLocations;
		this.ambushLocations = ambushLocations;
		this.itemLocations = itemLocations;
		this.guildId = guildId;
		this.userId = userId;
		this.member = member;
		this.webhook = webhook;

		this.activeTilesFormat = `../images/forbidden_forest/${this.level}/Active/`;
		this.inactiveTilesFormat = `../images/forbidden_forest/${this.level}/Inactive/`;
		this.encounterMessageCollector = null;
		this.dbKey = `${this.guildId}-${this.userId}`;
	}

	setPos(newPos) {
		if (typeof newPos != "number") throw new Error("newPos must be a number");
		newPos = newPos.toFixed(2);
		this.lastPos = this.curPos;
		this.curPos = newPos;

		this.bot.userInfo.set(this.dbKey, this.lastPos, "mazeInfo.lastPos");
		this.bot.userInfo.set(this.dbKey, this.curPos, "mazeInfo.curPos");
	}

	sendCurPosition() {
		let attachment = new Discord.MessageAttachment(`../images/forbidden_forest/${this.level}/Inactive/Forest_${this.curPos}X.png`, "map.png");
		if (this.itemLocations.includes(this.curPos)) {
			attachment = new Discord.MessageAttachment(`../images/forbidden_forest/${this.level}/Active/Forest_${this.curPos}.png`, "map.png");
		}

		this.webhook.send(attachment);
	}

	setLevelOne() {
		this.bot.log(`${this.member.displayName} moved from the second level of the maze to the first level.`, "info");
		this.setPos(parseFloat(firstLevelPos));
		this.level = "level1";

		this.bot.userInfo.set(this.dbKey, "level1", "mazeInfo.curMaze");
	}

	setLevelTwo() {
		this.bot.log(`${this.member.displayName} moved from the first level of the maze to the second level.`, "info");
		this.setPos(parseFloat(secondLevelPos));
		this.level = "level2";

		this.bot.userInfo.set(this.dbKey, "level2", "mazeInfo.curMaze");
	}

	moveUp() {
		const newPos = parseFloat(this.curPos) + movements["up"];
		this.setPos(newPos);
	}

	moveDown() {
		const newPos = parseFloat(this.curPos) + movements["down"];
		this.setPos(newPos);
	}

	moveLeft() {
		const newPos = parseFloat(this.curPos) + movements["left"];
		this.setPos(newPos);
	}

	moveRight() {
		const newPos = parseFloat(this.curPos) + movements["right"];
		this.setPos(newPos);
	}

	possibleActiveTiles() {
		return fs.readdirSync(this.activeTilesFormat);
	}

	possibleInactiveTiles() {
		fs.readdirSync(this.inactiveTilesFormat);
	}

	syncLocations() { // Ensures that all encounter, ambush, and item locations are available on the current level of the maze
		const tiles = this.possibleActiveTiles(); // A list of possible tiles on the current level

		if (this.encounterLocations.some(l => !tiles.some(t => t.includes(l))) || this.encounterLocations.length <= 0) {
			const possibleEncounters = encountersFile.filter(e => e.tiles.some(b => tiles.some(t => t.includes(b)))); // Filters encounters to ones available in the current level

			for (let i = 0; i < possibleEncounters.length; i++) {
				const encounter = possibleEncounters[i];
				encounter.tiles = encounter.tiles.filter(t => tiles.some(ti => ti.includes(t)));
			}

			const newLocations = possibleEncounters.map(e => e.tiles[Math.floor(Math.random() * e.tiles.length)]); // Create an array of new locations

			this.encounterLocations = newLocations;
			this.bot.userInfo.set(this.dbKey, newLocations, "mazeInfo.encounterPositions");
		}

		if (this.ambushLocations.some(l => !tiles.some(t => t.includes(l))) || this.ambushLocations.length <= 0) {
			const possibleAmbushes = ambushesFile.filter(e => e.tiles.some(b => tiles.some(t => t.includes(b))));

			for (let i = 0; i < possibleAmbushes.length; i++) {
				const ambush = possibleAmbushes[i];
				ambush.tiles = ambush.tiles.filter(a => tiles.some(ti => ti.includes(a)));
			}

			const newLocations = possibleAmbushes.map(e => e.tiles[Math.floor(Math.random() * e.tiles.length)]);

			this.ambushLocations = newLocations;
			this.bot.userInfo.set(this.dbKey, newLocations, "mazeInfo.ambushPositions");
		}

		if (this.itemLocations.some(l => !tiles.some(t => t.includes(l))) || this.itemLocations.length <= 0) {
			const possibleItems = itemsFile.filter(e => e.tiles.some(b => tiles.some(t => t.includes(b))));

			for (let i = 0; i < possibleItems.length; i++) {
				const item = possibleItems[i];
				item.tiles = item.tiles.filter(it => tiles.some(ti => ti.includes(it)));
			}

			const newLocations = possibleItems.map(e => e.tiles[Math.floor(Math.random() * e.tiles.length)]);

			this.itemLocations = newLocations;
			this.bot.userInfo.set(this.dbKey, newLocations, "mazeInfo.itemPositions");
		}
	}

	async	spawnAmbush() {
		const ambushInfo = ambushesFile.find(a => a.tiles.includes(this.curPos)); // Gets the ambush info from the ambush file
		if (!ambushInfo) return this.sendCurPosition(); // Invalid ambush location

		const userData = this.bot.userInfo.get(this.dbKey);

		if (ambushInfo.ambushType == "poison") {
			if (userData.stats.poisonedObject) return this.sendCurPosition(); // They've already been poisoned.
			if (userData.inventory.invisibilityCloak > 0) return this.sendCurPosition(); // Can't be ambushed if they have the invisibility cloak

			this.bot.log(`${this.member.displayName} is being ambushed by an ${ambushInfo.name}.`, "info");

			// Send the forest image with the creature on it
			const ambushAttachment = new Discord.MessageAttachment(this.activeTilesFormat + `Forest_${this.curPos}.png`, "map.png");
			await this.webhook.send(ambushAttachment);
			this.webhook.send("You were ambushed by an Acromantula. You stumble around, feeling weak as the poison courses through your veins. You'll need to find an antidote soon.");


			// Run the poisoned function on the user
			this.bot.functions.poisoned(this.member,
				`${this.member} has suffered an Acromantula bite and needs an antidote to common poison before they succumb to it.`,
				ambushInfo.poisonType,
				this.bot);


			const tiles = this.possibleActiveTiles();

			// Relocate ambush tile
			const ambushPositions = ambushInfo.tiles.filter(e => tiles.some(t => t.includes(e))); // Create a list of possible new ambush locations
			const newTile = ambushPositions[Math.floor(Math.random() * ambushPositions.length)]; // Grab a new tile at random

			// Replace the current tile with the new tile
			this.ambushLocations.splice(this.ambushLocations.indexOf(this.curPos), 1, newTile);
			this.bot.userInfo.set(this.dbKey, this.ambushLocations, "mazeInfo.ambushPositions");

			this.bot.log(`${ambushInfo.name} relocated to forbidden forest tile ${newTile}`);
		}
	}

	async spawnEncounter() {
		this.bot.log(`${this.member.displayName} has encountered a creature.`, "info");

		const encounterInfo = encountersFile.find(e => e.tiles.includes(this.curPos));
		if (!encounterInfo) return;

		this.bot.userInfo.set(this.dbKey, true, "mazeInfo.inFight");

		let userData = this.bot.userInfo.get(this.dbKey);

		const attachment = new Discord.MessageAttachment(this.activeTilesFormat + `Forest_${this.curPos}.png`, "map.png");
		await this.webhook.send(attachment);
		this.webhook.send(encounterInfo.spawnMessage);

		const filter = m => (m.content.toLowerCase().trim() == `${this.bot.prefix}${encounterInfo.spell}` && userData.studiedSpells.includes(encounterInfo.spell) ||
			m.content.toLowerCase() == `${this.bot.prefix}flee`);
		this.encounterMessageCollector = new Discord.MessageCollector(this.channel, filter);

		let health = encounterInfo.health;

		this.encounterMessageCollector.on("collect", collected => {
			if (collected.content == `${this.bot.prefix}flee`) {
				this.bot.log(`${this.member} has fled from their encounter.`, "info");
				this.encounterMessageCollector.stop();
				this.encounterMessageCollector = null;

				this.setPos(parseFloat(this.lastPos));
				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				this.bot.log(`${this.member.displayName} was attacked by their encounter`, "info");
				const damageByEncounter = userData.stats.defense < encounterInfo.attack ? encounterInfo.attack - userData.stats.defense : 0;

				userData.stats.health -= damageByEncounter;
				this.bot.userInfo.set(this.dbKey, userData.stats.health, "stats.health");

				if (userData.stats.health <= 0) {
					if (userData.inventory.resurrectionStone > 0 && (Date.now() - userData.cooldowns.lastResurrectionStoneUse) >= 3600000) {
						userData.stats.health += damageByEncounter;
						this.bot.userInfo.set(this.dbKey, userData.stats.health, "stats.health");
						return this.bot.useResurrectionStone(this.webhook, this.bot.guilds.get(this.guildId), this.member);
					}

					this.webhook.send("You have fainted!");
					return this.bot.functions.fainted(this.member,
						`${this.member} has fainted from a ${encounterInfo.name} attack! Would you like to use a revive potion to heal them faster?`,
						this.bot);
				}

				this.webhook.send(`The ${encounterInfo.name} attacked you!\n${damageByEncounter == 0 ? "It dealt no damage to you." : `You have ${userData.stats.health} health left`}`);

				return this.webhook.send("You have retreated back to your original position.");
			}

			userData = this.bot.userInfo.get(this.dbKey);

			const chance = Math.random() * 100;

			if (chance <= 50) { // Attacked by the encounter
				this.bot.log(`${this.member.displayName} was attacked by their encounter`, "info");
				const damageByEncounter = userData.stats.defense < encounterInfo.attack ? encounterInfo.attack - userData.stats.defense : 0;

				userData.stats.health -= damageByEncounter;
				this.bot.userInfo.set(this.dbKey, userData.stats.health, "stats.health");

				if (userData.stats.health <= 0) {
					if (userData.inventory.resurrectionStone > 0 && (Date.now() - userData.cooldowns.lastResurrectionStoneUse) >= 3600000) {
						userData.stats.health += damageByEncounter;
						this.bot.userInfo.set(this.dbKey, userData.stats.health, "stats.health");
						return this.bot.useResurrectionStone(this.webhook, this.bot.guilds.get(this.guildId), this.member);
					}

					this.webhook.send("You have fainted!");
					this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");
					return this.bot.functions.fainted(this.member,
						`${this.member} has fainted from a ${encounterInfo.name} attack! Would you like to use a revive potion to heal them faster?`,
						this.bot);
				}

				this.webhook.send(`The ${encounterInfo.name} attacked you!\n${damageByEncounter == 0 ? "It dealt no damage to you." : `You have ${userData.stats.health} health left`}`);
			}

			const damageByUser = encounterInfo.defense < userData.stats.attack ? userData.stats.attack - encounterInfo.defense : 0;
			health -= damageByUser;

			if (health <= 0) {
				this.bot.log(`${this.member.displayName} has defeated their encounter.`, "info");

				this.encounterMessageCollector.stop();
				this.encounterMessageCollector = null;

				this.bot.userInfo.math(this.dbKey, "+", encounterInfo.health, "xp");
				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				this.webhook.send(`You scared off the ${encounterInfo.name} and got ${encounterInfo.health} XP!`);

				const encounterTiles = encounterInfo.tiles.filter(t => this.possibleActiveTiles().some(p => p.toLowerCase().includes(t)));
				const newTile = encounterTiles[Math.floor(Math.random() * encounterTiles.length)];

				this.encounterLocations.splice(this.encounterLocations.indexOf(this.curPos), 1, newTile);
				this.bot.userInfo.set(this.dbKey, this.encounterLocations, "mazeInfo.encounterPositions");
				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				return this.bot.log(`${encounterInfo.name} relocated to forbidden forest tile ${newTile}`);
			}

			this.bot.log(`${this.member.displayName} attacked their encounter`, "info");
			this.webhook.send(`You cast ${encounterInfo.spell} for ${damageByUser} damage!\nThe ${encounterInfo.name} has/have ${health} health left.`);

		});
	}

	async centaurEncounter() {
		const userData = this.bot.userInfo.get(this.dbKey);
		const levelTwoUnlockedMessage = "Level two unlocked.";

		if (userData.inventory.invisibilityCloak > 0) {
			await this.webhook.send(levelTwoUnlockedMessage);

			this.moveUp();
			this.setLevelTwo();
			this.bot.log(`${this.member.displayName} moved from the first level of the forbidden forest to the second level via invisibility cloak`, "info");
			return this.sendCurPosition();
		}

		this.bot.userInfo.set(this.dbKey, true, "mazeInfo.inFight");

		await this.bot.functions.quickWebhook(this.channel, "Halt! What makes you think you can wander around my forest?", centaurWebhookInfo);

		setTimeout(async () => {
			await this.webhook.send("Your path is blocked by a centaur.");

			setTimeout(async () => {
				await this.webhook.send("What would you like to do?\n1. Ask for passage.\n2. Attack him.\n3. Turn around.");
			}, 600);

		}, 1200);

		const firstResponse = await this.bot.functions.awaitResponse(m => ["1", "2", "3"].includes(m.content), 120000, this.channel, true);
		if (!firstResponse) return; // No response

		if (firstResponse.content == "1") {
			await this.bot.functions.quickWebhook(this.channel, "I suppose I could let you pass, but I want something in return. I'm low on mallowsweet and the sky promises to be clear tonight. Bring me mallowsweet and you may continue on.", centaurWebhookInfo);

			setTimeout(async () => {
				await this.webhook.send("What would you like to do?\n1. Give Mallowsweet\n2. Go back the way you came.");
			}, 700);

			const secondResponse = await this.bot.functions.awaitResponse(m => ["1", "2"].includes(m.content), 120000, this.channel, true);
			if (!secondResponse) return;

			if (secondResponse.content == "1") {

				if (!userData.inventory.mallowsweet || userData.inventory.mallowsweet < 1) {
					this.bot.log(`${this.member.displayName} tried to trick the centaur.`, "info");
					this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");
					return this.bot.functions.quickWebhook(this.channel, "Are you trying to trick me? I hope you're aware that tricking a centaur is never a good choice.", centaurWebhookInfo);
				}

				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				userData.inventory.mallowsweet--;
				this.bot.userInfo.dec(this.dbKey, "inventory.mallowsweet");

				await this.bot.functions.quickWebhook(this.channel, "Thank you human, good luck in your adventures.", {
					username: "Centaur",
					avatar: "https://i.imgur.com/z4n0Jcf.jpg"
				});

				this.bot.log(`${this.member.displayName} moved from the first level of the forbidden forest to the second level via invisibility cloak`, "info");

				// Hagrid says
				setTimeout(() => {
					this.webhook.send(levelTwoUnlockedMessage);
				}, 500);

				this.moveUp();
				this.setLevelTwo();
				this.sendCurPosition();
			} else if (secondResponse.content == "2") {
				this.bot.log(`${this.member.displayName} decided not to give the centaur any mallowsweet`);

				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				// Set their curPos to tile to the left of the centaur
				this.setPos(parseFloat(this.lastPos));

				// Send their current position
				this.sendCurPosition();
			}
		} else if (firstResponse.content == "2") {
			this.bot.log(`${this.member.displayName} attacked the centaur.`);

			await this.webhook.send("You pull out your wand but before you can do anything you find yourself knocked backwards. The centaur attacks you, dealing 20 damage.");
			await this.bot.functions.quickWebhook(this.channel, "Silly little human. Don't try that again.", centaurWebhookInfo);

			userData.stats.health -= 20;
			this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");
			this.bot.userInfo.set(this.dbKey, userData.stats.health, "stats.health");

			if (userData.stats.health <= 0) {
				// If they have a resurrection stone
				if (userData.inventory.resurrectionStone > 0 && (Date.now - userData.cooldowns.lastResurrectionStoneUse) > 3600000) {
					this.bot.userInfo.math(this.dbKey, "+", 20, "stats.health");
					return this.bot.useResurrectionStone(this.webhook, this.bot.guilds.get(this.guildId), this.member);
				}

				// Send a message saying they fainted
				this.webhook.send("You have fainted!");
				// Execute the fainted function
				this.bot.functions.fainted(this.member,
					`${this.member} has fainted from a centaur attack! Would you like to use a revive potion to heal them faster?`,
					this.bot);
			}
		} else if (firstResponse.content == "3") {
			this.bot.log(`${this.member.displayName} retreated from the centaur`, "info");

			this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

			// Set their curPos to tile to the left of the centaur
			this.setPos(parseFloat(this.lastPos));
			// Send their current position
			this.sendCurPosition();
		}
	}

	async darkWizardEncounter() {
		this.bot.log(`${this.member.displayName} encounters the dark wizard`, "info");

		this.bot.userInfo.set(this.dbKey, true, "mazeInfo.inFight");
		const userData = this.bot.userInfo.get(this.dbKey);

		const darkWizardAttachment = new Discord.MessageAttachment(`../images/forbidden_forest/${this.level}/Active/Forest_${this.curPos}.png`, "map.png");
		await this.webhook.send(darkWizardAttachment);

		await this.bot.functions.quickWebhook(this.channel, "Kinda risky fer a young student like yourself to be wand'rin the forest all alone ain't it. You never know what kinda questionable characters you might find round these parts.", darkWizardWebhookInfo);

		setTimeout(async () => {
			await this.webhook.send("1. Ignore him\n2. Ask for help\n3. Offer to sell something");
		}, 1000);

		const response = await this.bot.functions.awaitResponse(m => ["1", "2", "3"].includes(m.content), 120000, this.channel, true);
		if (!response) return;

		if (response == "1") { // Flee
			this.bot.log(`${this.member.displayName} ignores the dark wizard`, "info");

			this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

			const chance = Math.random() * 100;

			if (chance > 50) {
				await this.webhook.send("You ignore the dark wizard. He gets angry and leaves.");

				setTimeout(() => {
					this.sendCurPosition();
				}, 1000);
			} else { // Attacks the user, taking an item from their inventory
				// Hagrid says
				this.webhook.send("You ignore the dark wizard. He attacks you and takes an item from your bag.");

				// Possible items that could be taken away
				const possibleItems = Object.keys(darkWizardItems).filter(i => this.bot.userInfo.get(this.dbKey, `inventory.${i}`) >= 0);
				// Item that will be taken away
				const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

				// If that item is undefined don't take away the item
				if (!item) return;
				// Decrease their amount of that item by 1
				this.bot.userInfo.dec(this.dbKey, `inventory.${item}`);
			}
		} else if (response == "2") { // Buy an item
			this.bot.log(`${this.member.displayName} is buying an item from the dark wizard`, "info");
			this.bot.functions.quickWebhook(this.channel, "Sure I could 'elp. Follow me over here.", darkWizardWebhookInfo);

			setTimeout(() => {
				// Move the user to the left
				this.moveLeft();
				this.bot.userInfo.set(this.dbKey, this.curPos, "mazeInfo.curPos");

				// Create an attachment for that area
				const attachment = new Discord.MessageAttachment(`../images/forbidden_forest/${this.level}/Active/Forest_${this.curPos}.png`, "map.png");
				// Send the attachment
				this.webhook.send(attachment);
			}, 2000);

			setTimeout(() => {
				this.bot.functions.quickWebhook(this.channel, `I've got a few things that you might need. Don't worry bout where they came from.\n${Object.keys(darkWizardItems).map(i => `${Object.keys(darkWizardItems).indexOf(i) + 1}. ${i.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())} - ${darkWizardItems[i].buy}`).join("\n")}`, darkWizardWebhookInfo);
			}, 2750);

			setTimeout(() => {
				this.webhook.send(`To buy an item use \`<item number> <amount>\`\nTo leave, use \`${this.bot.prefix}nevermind\``);
			}, 3750);

			const buyResponse = await this.bot.functions.awaitResponse(m =>
				(parseInt(m.content.split(/ +/)[0]) > 0 && parseInt(m.content.split(/ +/)[0]) <= Object.keys(darkWizardItems).length && parseInt(m.content.split(/ +/)[1]) > 0) ||
				m.content == `${this.bot.prefix}nevermind`, 120000, this.channel);

			// If they didn't respond don't do anything
			if (!buyResponse) return;

			// If they used the nevermind command
			if (buyResponse.content == `${this.bot.prefix}nevermind`) {
				this.bot.log(`${this.member.displayName} changed their mind.`, "info");

				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				// Chance for the dark wizard to attack the user
				const chance = Math.random() * 100;

				if (chance <= 50) { // Wizard doesn't attack user
					// Dark Wizard Says
					this.bot.functions.quickWebhook(this.channel, "If you change yer mind you know where to find me.", darkWizardWebhookInfo);
				} else { // Wizard attacks user
					this.bot.log(`${this.member.displayName} got attacked by the dark wizard`, "info");
					// Dark Wizard Says
					await this.functions.quickWebhook(this.channel, "You think it's funny to waste my time like that?!", darkWizardWebhookInfo);

					// Hagrid Says
					setTimeout(() => {
						this.send("You ignore the dark wizard. He attacks you and takes an item from your bag.");
					}, 1000);

					// Possible items that can decreased
					const possibleItems = Object.keys(darkWizardItems)
						.filter(i => this.bot.userInfo.hasProp(this.member.id, `inventory.${i}`) && this.bot.userInfo.get(this.member.id, `inventory.${i}`) > 0);

					// Item that will be taken away
					const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
					// If that item is undefined don't decrease it
					if (!item) return;

					// Decrease the amount of that item
					this.bot.userInfo.dec(this.member.id, `inventory.${item}`);
				}
			} else {
				// Args given
				const args = buyResponse.content.split(/ +/);

				// Item they'd like to buy
				const item = Object.keys(darkWizardItems)[parseInt(args[0]) - 1];
				// If that item is undefined don't do anything
				if (!item) return;

				// Amount of that item they'd like to buy
				const amount = parseInt(args[1]);

				// How much and what currency the item will cost
				const buyDetails = darkWizardItems[item].buy.split(/ +/);

				// Currency (eg knuts/sickles/galleons)
				const currency = buyDetails[1];

				// The cost of the item
				let price = parseInt(buyDetails[0]) * amount;

				// If the currency is sickles the price = (price * 29)
				if (currency === "sickles") price = price * 29;
				// If the currency is galleons the price = (price * 493)
				if (currency === "galleons") price = price * 493;

				// If they can't afford it then send a message saying they can't
				if ((userData.balance.sickles * 29) + (userData.balance.galleons * 493) + userData.balance.knuts < price) return this.webhook.send("You can't afford this item.");

				// Ensure they have the item key in their inventory object
				if (!this.bot.userInfo.hasProp(this.dbKey, `inventory.${item}`)) this.bot.userInfo.set(this.dbKey, 0, `inventory.${item}`);

				// Convert their money to knuts until they have enough to cover the cost of the item
				for (let i = 0; this.bot.userInfo.get(this.dbKey, "balance.knuts") < price; i++) {
					if (this.bot.userInfo.get(this.dbKey, "balance.sickles") <= 0 && this.bot.userInfo.get(this.dbKey, "balance.galleons") > 0) {
						this.bot.userInfo.math(this.dbKey, "+", 17, "balance.sickles");
						this.bot.userInfo.math(this.dbKey, "-", 1, "balance.galleons");
					}

					this.bot.userInfo.dec(this.dbKey, "balance.sickles");
					this.bot.userInfo.math(this.dbKey, "+", 29, "balance.knuts");
				}

				// Take away <price> knuts
				this.bot.userInfo.math(this.dbKey, "-", price, "balance.knuts");
				// Add <amount> item
				this.bot.userInfo.math(this.dbKey, "+", amount, `inventory.${item}`);

				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				// Dark wizard says
				this.bot.functions.quickWebhook(this.channel, "Pleasure doin' business with ya. You know where to find me if you need somethin' in the future.", darkWizardWebhookInfo);

				// Hagrid says
				setTimeout(() => {
					this.webhook.send("The dark wizard disappears.");
				}, 1000);
			}
		} else if (response.content === "3") { // If they want to sell an item
			this.bot.log(`${this.member} is selling an item to the dark wizard`, "info");

			// Items object formatted with the selling information
			const itemsMessage = Object.keys(darkWizardItems).map(i => `${Object.keys(darkWizardItems)
				.indexOf(i) + 1}. ${i.replace(/([A-Z])/g, " $1")
					.replace(/^./, str => str.toUpperCase())} - ${darkWizardItems[i].sell}`)
				.join("\n");

			// Dark wizard says
			await this.bot.functions.quickWebhook(this.channel, `What have you got? I swear you won't get no better rate anywhere else than I could offer yeh\n${itemsMessage}`, darkWizardWebhookInfo);

			// Hagrid says
			setTimeout(() => {
				this.webhook.send(`To sell an item use \`<item number> <amount>\`\nTo leave, use \`${this.bot.prefix}nevermind\``);
			}, 1000);

			// Await a response with what they'd like to buy and how much
			const sellResponse = await this.bot.functions.awaitResponse(m => (parseInt(m.content.split(/ +/)[0]) > 0 &&
				parseInt(m.content.split(/ +/)[0]) <= Object.keys(darkWizardItems).length &&
				parseInt(m.content.split(/ +/)[1]) > 0) ||
				m.content === `${this.bot.prefix}nevermind`, 120000, this.channel);

			// If they didn't respond don't do anything
			if (!sellResponse) return;

			// If they use the nevermind command
			if (sellResponse == `${this.bot.prefix}nevermind`) {
				this.bot.log(`${this.member} changed their mind.`, "info");

				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				// Chance for whether or not the dark wizard will attack them
				const chance = Math.random() * 100;

				if (chance <= 50) { // Dark wizard doesn't attack them
					// Dark wizard says
					this.bot.functions.quickWebhook(this.channel, "If you change yer mind you know where to find me.", darkWizardWebhookInfo);
				} else { // Dark wizard attacks them
					this.bot.log(`${this.member} got attacked by the dark wizard`, "info");

					// Dark wizard says
					await this.bot.functions.quickWebhook(this.channel, "You think it's funny to waste my time like that?!", darkWizardWebhookInfo);

					// Hagrid says
					setTimeout(() => {
						this.webhook.send("You ignore the dark wizard. He attacks you and takes an item from your bag.");
					}, 900);

					// Possible items that could be decreased
					const possibleItems = Object.keys(darkWizardItems)
						.filter(i => this.bot.userInfo.hasProp(this.member.id, `inventory.${i}`) && this.bot.userInfo.get(this.member.id, `inventory.${i}`) > 0);

					// Item that will be decreased
					const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

					// If that item is undefined don't decrease it
					if (!item) return;

					// Decrease the item
					this.bot.userInfo.dec(this.member.id, `inventory.${item}`);
				}
			} else {
				// Args given
				const args = sellResponse.content.split(/ +/);

				// Item they'd like to sell
				const item = Object.keys(darkWizardItems)[parseInt(args[0]) - 1];
				// If there is no item don't do anything
				if (!item) return;

				// Amount they'd like to sell
				const amount = parseInt(args[1]);

				// The selling rate and currency of the item
				const buyDetails = darkWizardItems[item].buy.split(/ +/);

				// The currency of the item eg knuts/sickles/galleons
				const currency = buyDetails[1];

				// The amount of knuts they'll get when they sell the item
				let price = parseInt(buyDetails[0]) * amount;

				// Ensure they have the item's key in their inventory object
				if (!this.bot.userInfo.hasProp(this.dbKey, `inventory.${item}`)) this.bot.userInfo.set(this.dbKey, `inventory.${item}`);
				// If they don't have <amount> of the item then send a message saying they don't have enough
				if (this.bot.userInfo.get(this.dbKey, `inventory.${item}`) < amount) return this.webhook.send("You don't have enough to sell!");

				// Take away <amount> <item>
				this.bot.userInfo.math(this.dbKey, "-", amount, `inventory.${item}`);
				// Give them <price> <currency>
				this.bot.userInfo.math(this.dbKey, "+", price, `balance.${currency}`);

				this.bot.userInfo.set(this.dbKey, false, "mazeInfo.inFight");

				// Dark wizard says
				this.bot.functions.quickWebhook(this.channel, "Pleasure doin' business with ya. You know where to find me next time you've got goods to unload.", darkWizardWebhookInfo);

				// Hagrid says
				setTimeout(() => {
					this.webhook.send("The dark wizard disappears.");
				}, 1000);
			}
		}
	}
}

module.exports = ForbiddenForest;
