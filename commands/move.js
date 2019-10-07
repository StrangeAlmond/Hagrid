const Discord = require("discord.js");
const fs = require("fs");
const mazePosition = require("../mazeInfo/mazePositions.json");
const encountersFile = require("../mazeInfo/encounters.json");
const ambushesFile = require("../mazeInfo/ambushes.json");
const itemsFile = require("../mazeInfo/items.json");
const messageCollectors = {};

module.exports = {
	name: "move",
	description: "Move around the maze",
	async execute(message, args, bot) {
		// Ensure they own this channel
		if (!message.channel.name.includes(message.member.displayName.toLowerCase().replace(/[^a-z0-9+ ]+/gi, "").split(/ +/).join("-"))) return message.channel.send(`❌ | Use \`${bot.prefix}start\` to begin your journey!`);

		// Get the user's data from the database
		const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		// Ensure they haven't fainted and aren't currently in a fight
		if (user.stats.fainted) return;
		if (user.mazeInfo.inFight) return;

		// Get their current position and format it
		let curPos = parseFloat(user.mazeInfo.curPos).toFixed(2);

		// Get the channels webhooks
		let channelWebhooks = await message.channel.fetchWebhooks();
		channelWebhooks = channelWebhooks.array().filter(w => w.name.toLowerCase() === bot.user.username.toLowerCase());

		// If there are less than 5 webhooks with the bot's name then create more until there are 5
		if (channelWebhooks.length < 5) {
			for (let i = channelWebhooks.length; i < 5; i++) {
				await message.channel.createWebhook(bot.user.username, bot.user.displayAvatarURL).then(w => channelWebhooks.push(w));
			}
		}

		// Grab a random webhook to use for sending messages
		const webhook = channelWebhooks[Math.floor(Math.random() * channelWebhooks.length)];

		// If they didn't specify a direction to move send their current position
		if (!args[0]) return sendCurPosition();

		// If the possible moves for that location don't include the move they specified
		if (!mazePosition[curPos].validMoves.includes(args[0])) return webhook.send("The trees look a little too thick that direction, better try a different way.");

		// If the user is in level 2 but their encounter/item/ambush tiles are setup for level 1 change it to level 2 tiles and vice versa
		checkTiles();

		// Set their lastPos to their current pos
		user.mazeInfo.lastPos = curPos;
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.mazeInfo.lastPos, "mazeInfo.lastPos");

		// Change their position based on their movement
		if (args[0] === "up") curPos = parseFloat(curPos) - 1;
		if (args[0] === "down") curPos = parseFloat(curPos) + 1;
		if (args[0] === "left") curPos = parseFloat(curPos) - 0.01;
		if (args[0] === "right") curPos = parseFloat(curPos) + 0.01;

		// Format the curpos again
		curPos = curPos.toFixed(2);

		// If they're trying to enter level 2 execute the centaur function
		if (curPos === "33.12" && user.mazeInfo.lastPos === "34.12") return centaur();

		// Set their new position
		user.mazeInfo.curPos = curPos;
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, curPos, "mazeInfo.curPos");

		// If they're traveling from the 2nd level to the 1st level set their curMaze to the 1st level
		if (curPos === "34.12" && user.mazeInfo.lastPos === "33.12") bot.userInfo.set(`${message.guild.id}-${message.author.id}`, "level1", "mazeInfo.curMaze");

		// If they're visiting the dark wizard execute the darkWizard function
		if (curPos === "34.14" && user.mazeInfo.lastPos === "35.14") return darkWizard();
		// If they've entered an ambush positon spawn the ambush
		if (user.mazeInfo.ambushPositions.includes(curPos)) return spawnAmbush();
		// If they've entered an encounter position spawn the encounter
		if (user.mazeInfo.encounterPositions.includes(curPos)) return spawnEncounter();

		// Send their current position
		sendCurPosition();

		// Function to send the user's current position
		function sendCurPosition() {
			// Create an image for their current location
			let attachment = new Discord.Attachment(`./mazeInfo/${user.mazeInfo.curMaze}/Inactive/Forest_${curPos}X.png`, "map.png");

			// If there's a loot bag there set the image as an active tile instead of an inactive one
			if (user.mazeInfo.itemPositions.includes(curPos)) attachment = new Discord.Attachment(`./mazeInfo/${user.mazeInfo.curMaze}/Active/Forest_${curPos}.png`, "map.png");

			// Send the image
			webhook.send(attachment);
		}

		// Function to stop the message collectors
		function stopMessageCollector() {
			// Stop the message collector
			messageCollectors[message.author.id].stop();
			// Remove the collector from the object
			delete messageCollectors[message.author.id];
		}

		// Function to use the user's resurrection stone
		function useResurrectionStone() {
			// Send the resurrection stone message
			webhook.send(`Just as ${message.author} was about to be attacked, the spirit of their loved one appeared and protected them.`);
			// Set their last use to now
			user.cooldowns.lastResurrectionStoneUse = Date.now();
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.cooldowns.lastResurrectionStoneUse, "cooldowns.lastResurrectionStoneUse");
		}

		// Function to ensure their tiles are setup for their current level of the maze
		function checkTiles() {
			// If their encounters aren't setup for their current level of the maze
			if (!user.mazeInfo.encounterPositions.some(t => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(t)))) {
				// Make an array with encounter positions that are
				const encounterTiles = encountersFile.filter(e => e.tiles.some(b => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(b))));
				// Make an array with a random encounter position from each entry in encounterTiles
				const tiles = encounterTiles.map(e => e.tiles[Math.floor(Math.random() * e.tiles.length)]);

				// Set their encounter positions
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, tiles, "mazeInfo.encounterPositions");
			}

			// If their items aren't setup for their current level of the maze
			if (!user.mazeInfo.itemPositions.some(i => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(i)))) {
				// Make an array with item positions that are
				const itemTiles = Object.values(itemsFile).filter(i => i.tiles.some(b => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(c => c.includes(b))));
				// make an array with a random item position from each entry in itemTiles
				const tiles = itemTiles.map(i => i.tiles[Math.floor(Math.random() * i.tiles.length)]);

				// Set their new item positions
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, tiles, "mazeInfo.itemPositions");
			}

			// If their ambushes aren't setup for their current level of the maze
			if (!user.mazeInfo.ambushPositions.some(i => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(i)))) {
				// Make an array with ambush positions that are
				const ambushTiles = ambushesFile.filter(e => e.tiles.some(b => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(b))));
				// Make an array with a random ambush position from each entry in ambushTiles
				const tiles = ambushTiles.map(a => a.tiles[Math.floor(Math.random() * a.tiles.length)]);

				// Set their new ambush positions
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, tiles, "mazeInfo.ambushPositions");
			}
		}

		// Function to await a response
		function awaitResponse(filter, time) {
			// Return a Promise
			return new Promise((resolve, reject) => {

				// Create a message collector
				const messageCollector = new Discord.MessageCollector(message.channel, filter, {
					maxMatches: 1,
					time: time
				});

				// Whether or not a response has been collected
				let responseCollected = false;

				// If/when the message collector collects a message
				messageCollector.on("collect", collected => {
					// Set responseCollected to true and resolve the promise with the message
					responseCollected = true;
					resolve(collected);
					// Stop the message collector
					messageCollector.stop();
				});

				// When the message collector ends
				messageCollector.on("end", collected => {
					// If a message wasn't collected resolve the promise with undefined
					if (!responseCollected) resolve(undefined);
				});
			});
		}

		// Function for a user to go the 2nd level of the maze
		async function centaur() {
			// If the user has an invisibility cloak
			if (user.inventory.invisibilityCloak > 0) {
				// Allow them to go to the 2nd level without talking to the centaur
				await webhook.send("Level two unlocked.");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, "level2", "mazeInfo.curMaze");
				return sendCurPosition();
			}

			// Centaur says
			await bot.quickWebhook(message.channel, "Halt! What makes you think you can wander around my forest?", {
				username: "Centaur",
				avatar: "https://i.imgur.com/z4n0Jcf.jpg"
			});

			// Hagrid Says
			setTimeout(async () => {
				await webhook.send("Your path is blocked by a centaur.");
				await webhook.send("What would you like to do?\n1. Ask for passage.\n2. Attack him.\n3. Turn around.");
			}, 1100);

			// await a response of "1", "2", or "3"
			const response = await awaitResponse(m => ["1", "2", "3"].includes(m.content), 120000);
			// If they didn't respond don't do anything
			if (!response) return;

			// If they chose 1
			if (response.content === "1") { // Asks to pass to level 2
				// Centaur says
				await bot.quickWebhook(message.channel, "I suppose I could let you pass, but I want something in return. I'm low on mallowsweet and the sky promises to be clear tonight. Bring me mallowsweet and you may continue on.", {
					username: "Centaur",
					avatar: "https://i.imgur.com/z4n0Jcf.jpg"
				});

				// Bots says
				setTimeout(async () => {
					await webhook.send("What would you like to do?\n1. Give Mallowsweet\n2. Go back the way you came.");
				}, 700);

				// Await a response of "1" or "2"
				const responseTwo = await awaitResponse(m => ["1", "2"].includes(m.content), 120000);
				// If they didn't respond don't do anything
				if (!responseTwo) return;

				// If they chose 1
				if (responseTwo.content === "1") {
					// If they don't have any mallowseet
					if (!user.inventory.mallowsweet || user.inventory.mallowsweet <= 0) {
						return bot.quickWebhook(message.channel, "Are you trying to trick me? I hope you're aware that tricking a centaur is never a good choice.", {
							username: "Centaur",
							avatar: "https://i.imgur.com/z4n0Jcf.jpg"
						});
					}

					// Centaur says
					await bot.quickWebhook(message.channel, "Thank you human, good luck in your adventures.", {
						username: "Centaur",
						avatar: "https://i.imgur.com/z4n0Jcf.jpg"
					});

					// Hagrid says
					setTimeout(() => {
						webhook.send("Level two unlocked.");
					}, 500);

					// Set their new position
					user.mazeInfo.curPos = curPos;
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, curPos, "mazeInfo.curPos");

					// Set their current maze to level2
					user.mazeInfo.curMaze = "level2";
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, "level2", "mazeInfo.curMaze");

					// Decrease their mallowsweet by 1
					bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.mallowsweet");

					// Send their current position
					sendCurPosition();
				} else if (responseTwo.content === "2") { // If they chose 2
					// Set their curPos to tile to the left of the centaur
					curPos = "34.11";

					// Set their new curPos
					user.mazeInfo.curPos = curPos;
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, curPos, "mazeInfo.curPos");

					// Send their current position
					sendCurPosition();
				}
			} else if (response.content === "2") { // If they chose 2
				// Bot and Centaur say
				await webhook.send("You pull out your wand but before you can do anything you find yourself knocked backwards. The centaur attacked you for 20 damage.");
				await bot.quickWebhook(message.channel, "Silly little human. Don't try that again.", {
					username: "Centaur",
					avatar: "https://i.imgur.com/z4n0Jcf.jpg"
				});

				// Take away 20 health
				user.stats.health -= 20;
				bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 20, "stats.health");

				// If they're at or below 0 health
				if (user.stats.health <= 0) {
					// If they have a resurrection stone
					if (user.inventory.resurrectionStone > 0) {
						bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 20, "stats.health");
						return useResurrectionStone();
					}

					// Send a message saying they fainted
					webhook.send("You have fainted!");

					// Execute the fainted function
					bot.fainted(message.member, `${message.author} has fainted from a centaur attack! Would you like to use a revive potion to heal them faster?`);
				}
			} else if (response.content === "3") { // If they chose 3
				// Set their curPos to tile to the left of the centaur
				curPos = "34.11";

				// Set their curPos
				user.mazeInfo.curPos = curPos;
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, curPos, "mazeInfo.curPos");

				// Send their current position
				sendCurPosition();
			}
		}

		// Function for interacting with the dark wizard
		async function darkWizard() {
			// Create an attachment with the dark wizard on it
			const darkWizardAttachment = new Discord.Attachment(`./mazeInfo/${user.mazeInfo.curMaze}/Active/Forest_${user.mazeInfo.curPos}.png`, "map.png");
			// Send the attachment
			await webhook.send(darkWizardAttachment);

			// Dark Wizard Says
			await bot.quickWebhook(message.channel, "Kinda risky fer a young student like yourself to be wand'rin the forest all alone ain't it. You never know what kinda questionable characters you might find round these parts.", {
				username: "Dark Wizard",
				avatar: "https://i.imgur.com/oXahnDf.png"
			});

			// Hagrid Says
			setTimeout(async () => {
				await webhook.send("1. Ignore him\n2. Ask for help\n3. Offer to sell something");
			}, 1000);

			// Await a response
			const response = await awaitResponse(m => ["1", "2", "3"].includes(m.content), 120000);
			if (!response) return;

			// Possible items that the user can buy/sell
			const items = {
				"billywigStingSlime": {
					buy: "24 knuts",
					sell: "4 knuts"
				},
				"boomBerryJuice": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"bottleOfHorklumpJuice": {
					buy: "24 knuts",
					sell: "4 knuts"
				},
				"chizpurfleFangs": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"dropsOfHoneywater": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"lionfishSpines": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"moondewDrops": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"slothBrainMucus": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"sprigOfWolfsbane": {
					buy: "24 knuts",
					sell: "4 knuts"
				},
				"stewedMandrake": {
					buy: "16 knuts",
					sell: "2 knuts"
				},
				"vialOfFlobberwormMucus": {
					buy: "24 knuts",
					sell: "4 knuts"
				},
				"vialOfSalamanderBlood": {
					buy: "3 sickles",
					sell: "4 sickles"
				},
				"standardIngredients": {
					buy: "3 sickles",
					sell: "4 sickles"
				}
			};

			if (response.content === "1") { // Ignore the wizard
				// Chance for whether or not he attacks the user
				const chance = Math.random() * 100;

				// Doesn't attack the user
				if (chance > 50) {
					await webhook.send("You ignore the dark wizard. He gets angry and leaves.");

					setTimeout(() => {
						sendCurPosition();
					}, 1000);
				} else { // Attacks the user, taking an item from their inventory
					// Hagrid says
					webhook.send("You ignore the dark wizard. He attacks you and takes an item from your bag.");

					// Possible items that could be taken away
					const possibleItems = Object.keys(items).filter(i => bot.userInfo.get(`${message.guild.id}-${message.author.id}`, `inventory.${i}`) >= 0);
					// Item that will be taken away
					const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

					// If that item is undefined don't take away the item
					if (!item) return;

					// Decrease their amount of that item by 1
					bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, `inventory.${item}`);
				}
			} else if (response.content === "2") { // Buy an item from the wizard
				// Dark Wizard Says
				bot.quickWebhook(message.channel, "Sure I could 'elp. Follow me over here.", {
					username: "Dark Wizard",
					avatar: "https://i.imgur.com/oXahnDf.png"
				});

				setTimeout(() => {
					// Move the user to the left
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 34.13, "mazeInfo.curPos");

					// Create an attachment for that area
					const attachment = new Discord.Attachment(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active/Forest_${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos")}.png`, "map.png");
					// Send the attachment
					webhook.send(attachment);
				}, 2000);

				// Dark Wizard Says
				setTimeout(() => {
					bot.quickWebhook(message.channel, `I've got a few things that you might need. Don't worry bout where they came from.\n${Object.keys(items).map(i => `${Object.keys(items).indexOf(i) + 1}. ${i.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())} - ${items[i].buy}`).join("\n")}`, {
						username: "Dark Wizard",
						avatar: "https://i.imgur.com/oXahnDf.png"
					});
				}, 2500);

				// Hagrid Says
				setTimeout(() => {
					webhook.send(`To buy an item use \`<item number> <amount>\`\nTo leave, use \`${bot.prefix}nevermind\``);
				}, 4500);

				// Await a response saying what they'd like to buy
				const buyResponse = await awaitResponse(m => (parseInt(m.content.split(/ +/)[0]) > 0 && parseInt(m.content.split(/ +/)[0]) <= Object.keys(items).length && parseInt(m.content.split(/ +/)[1]) > 0) || m.content === `${bot.prefix}flee`);
				// If they didn't respond don't do anything
				if (!buyResponse) return;

				// If they used the nevermind command
				if (buyResponse.content === `${bot.prefix}nevermind`) {
					// Chance for the dark wizard to attack the user
					const chance = Math.random() * 100;

					if (chance <= 50) { // Wizard doesn't attack user

						// Dark Wizard Says
						bot.quickWebhook(message.channel, "If you change yer mind you know where to find me.", {
							username: "Dark Wizard",
							avatar: "https://i.imgur.com/oXahnDf.png"
						});
					} else { // Wizard attacks user

						// Dark Wizard Says
						await bot.quickWebhook(message.channel, "You think it's funny to waste my time like that?!", {
							username: "Dark Wizard",
							avatar: "https://i.imgur.com/oXahnDf.png"
						});

						// Hagrid Says
						setTimeout(() => {
							webhook.send("You ignore the dark wizard. He attacks you and takes an item from your bag.");
						}, 900);

						// Possible items that can decreased
						const possibleItems = Object.keys(items).filter(i => bot.userInfo.hasProp(user.id, `inventory.${i}`) && bot.userInfo.get(user.id, `inventory.${i}`) > 0);
						// Item that will be taken away
						const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

						// If that item is undefined don't decrease it
						if (!item) return;

						// Decrease the amount of that item
						bot.userInfo.dec(user.id, `inventory.${item}`);
					}
				} else {
					// Args given
					const args = buyResponse.content.split(/ +/);

					// Item they'd like to buy
					const item = Object.keys(items)[parseInt(args[0]) - 1];
					// If that item is undefined don't do anything
					if (!item) return;

					// Amount of that item they'd like to buy
					const amount = parseInt(args[1]);

					// How much and what currency the item will cost
					const buyDetails = items[item].buy.split(/ +/);

					// Currency (eg knuts/sickles/galleons)
					const currency = buyDetails[1];

					// The cost of the item
					let price = parseInt(buyDetails[0]) * amount;

					// If the currency is sickles the price = (price * 29)
					if (currency === "sickles") price = price * 29;
					// If the currency is galleons the price = (price * 493)
					if (currency === "galleons") price = price * 493;

					// If they can't afford it then send a message saying they can't
					if ((user.balance.sickles * 29) + (user.balance.galleons * 493) < price) return webhook.send("You can't afford this item.");

					// Ensure they have the item key in their inventory object
					if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${item}`)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, `inventory.${item}`);

					// Convert their money to knuts until they have enough to cover the cost of the item
					for (let i = 0; bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.knuts") < price; i++) {
						if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.sickles") <= 0 && bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.galleons") > 0) {
							bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 17, "balance.sickles");
							bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 1, "balance.galleons");
						}

						bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "balance.sickles");
						bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 29, "balance.knuts");
					}

					// Take away <price> knuts
					bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", price, "balance.knuts");
					// Add <amount> item
					bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, `inventory.${item}`);

					// Dark wizard says
					bot.quickWebhook(message.channel, "Pleasure doin' business with ya. You know where to find me if you need somethin' in the future.", {
						username: "Dark Wizard",
						avatar: "https://i.imgur.com/oXahnDf.png"
					});

					// Hagrid says
					setTimeout(() => {
						webhook.send("The dark wizard disappears.");
					}, 1000);
				}
			} else if (response.content === "3") { // If they want to sell an item
				// Items object formatted with the selling information
				const itemsMessage = Object.keys(items).map(i => `${Object.keys(items).indexOf(i) + 1}. ${i.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())} - ${items[i].sell}`).join("\n");

				// Dark wizard says
				await bot.quickWebhook(message.channel, `What have you got? I swear you won't get no better rate anywhere else than I could offer yeh\n${itemsMessage}`, {
					username: "Dark Wizard",
					avatar: "https://i.imgur.com/oXahnDf.png"
				});

				// Hagrid says
				setTimeout(() => {
					webhook.send("To sell an item use `<item number> <amount>`\nTo leave, use `!nevermind`");
				}, 1000);

				// Await a response with what they'd like to buy and how much
				const sellResponse = await awaitResponse(m => (parseInt(m.content.split(/ +/)[0]) > 0 && parseInt(m.content.split(/ +/)[0]) <= Object.keys(items).length && parseInt(m.content.split(/ +/)[1]) > 0) || m.content === `${bot.prefix}flee`);
				// If they didn't respond don't do anything
				if (!sellResponse) return;

				// If they use the nevermind command
				if (sellResponse === `${bot.prefix}nevermind`) {
					// Chance for whether or not the dark wizard will attack them
					const chance = Math.random() * 100;

					if (chance <= 50) { // Dark wizard doesn't attack them

						// Dark wizard says
						bot.quickWebhook(message.channel, "If you change yer mind you know where to find me.", {
							username: "Dark Wizard",
							avatar: "https://i.imgur.com/oXahnDf.png"
						});
					} else { // Dark wizard attacks them

						// Dark wizard says
						await bot.quickWebhook(message.channel, "You think it's funny to waste my time like that?!", {
							username: "Dark Wizard",
							avatar: "https://i.imgur.com/oXahnDf.png"
						});

						// Hagrid says
						setTimeout(() => {
							webhook.send("You ignore the dark wizard. He attacks you and takes an item from your bag.");
						}, 900);

						// Possible items that could be decreased
						const possibleItems = Object.keys(items).filter(i => bot.userInfo.hasProp(user.id, `inventory.${i}`) && bot.userInfo.get(user.id, `inventory.${i}`) > 0);
						// Item that will be decreased
						const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];

						// If that item is undefined don't decrease it
						if (!item) return;

						// Decrease the item
						bot.userInfo.dec(user.id, `inventory.${item}`);
					}
				} else {
					// Args given
					const args = sellResponse.content.split(/ +/);

					// Item they'd like to sell
					const item = Object.keys(items)[parseInt(args[0]) - 1];
					// If there is no item don't do anything
					if (!item) return;

					// Amount they'd like to sell
					const amount = parseInt(args[1]);

					// The selling rate and currency of the item
					const buyDetails = items[item].buy.split(/ +/);

					// The currency of the item eg knuts/sickles/galleons
					const currency = buyDetails[1];

					// The amount of knuts they'll get when they sell the item
					let price = parseInt(buyDetails[0]) * amount;

					// Ensure they have the item's key in their inventory object
					if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${item}`)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, `inventory.${item}`);
					// If they don't have <amount> of the item then send a message saying they don't have enough
					if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, `inventory.${item}`) < amount) return webhook.send("You don't have enough to sell!");

					// Take away <amount> <item>
					bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", amount, `inventory.${item}`);

					// Give them <price> <currency>
					bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", price, `balance.${currency}`);

					// Dark wizard says
					bot.quickWebhook(message.channel, "Pleasure doin' business with ya. You know where to find me next time you've got goods to unload.", {
						username: "Dark Wizard",
						avatar: "https://i.imgur.com/oXahnDf.png"
					});

					// Hagrid says
					setTimeout(() => {
						webhook.send("The dark wizard disappears.");
					}, 1000);
				}
			}
		}

		// Function to spawn an ambush
		function spawnAmbush() {
			// The ambush information
			const ambushInfo = ambushesFile.find(a => a.tiles.includes(curPos));
			// If there is no ambush on this tile send their current position
			if (!ambushInfo) return sendCurPosition();

			// If the ambush is a poisoning ambush
			if (ambushInfo.ambushType === "poison") {
				// If they've already been poisoned don't poison them again
				if (user.stats.poisonedObject) return sendCurPosition();
				// If they have the invisibility cloak don't poison them
				if (user.inventory.invisibilityCloak >= 1) return sendCurPosition();

				// Attachment with the ambush on it
				const ambushAttachment = new Discord.Attachment(`./mazeInfo/${user.mazeInfo.curMaze}/Active/Forest_${user.mazeInfo.curPos}.png`, "map.png");
				// Send the attachment
				webhook.send(ambushInfo.spawnMessage, ambushAttachment);

				// Execute the poisoned function on the user
				bot.poisoned(message.member, `${message.author} has suffered an Acromantula bite and needs an antidote to common poison before they succumb to it.`, ambushInfo.poisonType);

				// Ambush positions in this level of the maze
				const ambushPositions = user.mazeInfo.ambushPositions.filter(i => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.toLowerCase().includes(i)));
				// The new tile for this ambush
				const newTile = ambushPositions[Math.floor(Math.random() * ambushPositions.length)];

				// Replace the ambush's tile with the new one
				user.mazeInfo.ambushPositions.splice(user.mazeInfo.ambushPositions.indexOf(curPos), 1, newTile);
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.mazeInfo.ambushPositions, "mazeInfo.ambushPositions");
			}
		}

		// Function to spawn an encounter
		function spawnEncounter() {
			// Encounter information for this tile
			const encounterInfo = encountersFile.find(e => e.tiles.includes(curPos));
			// If there is no encounter information for this tile send the user's current position
			if (!encounterInfo) return sendCurPosition();

			// Set their inFight status to true
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, true, "mazeInfo.inFight");
			user.mazeInfo.inFight = true;

			// Create an attachment with the encounter on it
			const encounterAttachment = new Discord.Attachment(`./mazeInfo/${user.mazeInfo.curMaze}/Active/Forest_${user.mazeInfo.curPos}.png`, "map.png");
			// Send the attachment
			webhook.send(encounterInfo.spawnMessage, encounterAttachment);

			// Filter for the message collector
			const filter = m => (m.content.toLowerCase().trim() === `${bot.prefix}${encounterInfo.spell}` && user.studiedSpells.includes(encounterInfo.spell)) || m.content.toLowerCase() === `${bot.prefix}flee`;
			// Create a message collector for fighting the encounter
			messageCollectors[message.author.id] = new Discord.MessageCollector(message.channel, filter);

			// The encounter's health
			let health = encounterInfo.health;

			// When the user attacks the encounter or uses the flee command
			messageCollectors[message.author.id].on("collect", collected => {

				// If they decided to flee
				if (collected.content === `${bot.prefix}flee`) {
					// Stop the message collector
					stopMessageCollector();

					// Get their last position in the maze
					const lastPos = user.mazeInfo.lastPos;

					// Swap their current position and their last position
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, curPos, "mazeInfo.lastPos");
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, lastPos, "mazeInfo.curPos");
					user.mazeInfo.lastPos = curPos;
					user.mazeInfo.curPos = lastPos;

					// They're no longer in a fight
					user.mazeInfo.inFight = false;

					// Hagrid says
					webhook.send("You have retreated back to your original position.");

					// The amount of damage dealt by the encounter
					let damageDealtByEncounter = encounterInfo.attack - user.stats.defense;
					if (damageDealtByEncounter < 0) damageDealtByEncounter = 0;

					// If the attack is fatal and the user has a resurrection stone
					if ((damageDealtByEncounter - user.stats.health) <= 0 && user.inventory.resurrectionStone >= 1 && (Date.now() - user.cooldowns.lastResurrectionStoneUse) > 3600000) {
						// Execute the resurrection stone function
						useResurrectionStone();
					} else {
						// Otherwise take away the amount of damage the encounter did from the user's health
						user.stats.health -= damageDealtByEncounter;
						bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.stats.health, "stats.health");
					}

					// If they user fainted
					if (user.stats.health <= 0) {
						// Send a message saying they did
						webhook.send("You have fainted!");

						// Set their inFight status to false
						bot.userInfo.set(`${message.guild.id}-${message.author.id}`, false, "mazeInfo.inFight");

						// Execute the fainted function on the user
						return bot.fainted(message.member, `${message.author} has fainted from a ${encounterInfo.name} attack! Would you like to use a revive potion to heal them faster?`);
					} else { // Otherwise if they didn't faint
						// Send a message saying they were attacked
						webhook.send(`The ${encounterInfo.name} attacked you!\nYou have ${user.stats.health} health left`);
					}

					// Send the user's current position
					return sendCurPosition();
				}

				// The amount of damage dealt by the user to the encounter
				let damageDealtByUser = user.stats.attack - encounterInfo.defense;
				if (damageDealtByUser < 0) damageDealtByUser = 0;

				// Take away <damageDealtByUser> health from the encounter's health
				health -= damageDealtByUser;

				// Chance for whether or not the encounter will attack the user
				const chanceForAttack = Math.random() * 100;

				// If the chanceForAttack is below or equal to 50 then the encounter will attack
				if (chanceForAttack <= 50) {
					// The amount of damage dealt by the encounter
					let damageDealtByEncounter = encounterInfo.attack - user.stats.defense;
					if (damageDealtByEncounter < 0) damageDealtByEncounter = 0;

					// If the attack is fatal and the user has a resurrection stone available for use
					if ((damageDealtByEncounter - user.stats.health) <= 0 && user.inventory.resurrectionStone >= 1 && (Date.now() - user.cooldowns.lastResurrectionStoneUse) > 3600000) {
						// Execute the userResurrectionStone function
						useResurrectionStone();
					} else { // Otherwise
						// Take away the amount of damagae dealt by the encounter from the user's health
						user.stats.health -= damageDealtByEncounter;
						bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.stats.health, "stats.health");
					}

					// If the user fainted
					if (user.stats.health <= 0) {
						// Stop the message collector
						stopMessageCollector();

						// Send a message saying they fainted
						webhook.send("You have fainted!");

						// Set their inFight status to false
						bot.userInfo.set(`${message.guild.id}-${message.author.id}`, false, "mazeInfo.inFight");

						// Execute the fainted function on the user
						return bot.fainted(message.member, `${message.author} has fainted from a ${encounterInfo.name} attack! Would you like to use a revive potion to heal them faster?`);
					} else { // Otherwise if the encounter didn't attack
						// Send a message saying the encounter attacked them
						webhook.send(`The ${encounterInfo.name} attacked you!\nYou have ${user.stats.health} health left.`);
					}
				}

				// If the encounter is dead
				if (health <= 0) {
					// Stop the message collector
					stopMessageCollector();

					// Add encounterInfo.health xp to the user's xp
					user.xp += encounterInfo.health;
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.xp, "xp");

					// Set the user's inFight status to false
					user.mazeInfo.inFight = false;
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, false, "mazeInfo.inFight");

					// Hagrid says
					webhook.send(`You scared off the ${encounterInfo.name} and got ${encounterInfo.health} XP!`);

					// Possible tiles that are *only* in the the user's current maze
					const mazeTiles = encounterInfo.tiles.filter(i => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.toLowerCase().includes(i)));
					// The new tile for this encounter
					const newTile = mazeTiles[Math.floor(Math.random() * mazeTiles.length)];

					// Replace this encounter's tile with the new tile
					user.mazeInfo.encounterPositions.splice(user.mazeInfo.encounterPositions.indexOf(curPos), 1, newTile);
					bot.userInfo.set(`${message.guild.id}-${message.author.id}`, user.mazeInfo.encounterPositions, "mazeInfo.encounterPositions");
				} else { // Otherwise if the encounter isn't dead

					// Send a message saying the user attacked the encounter
					webhook.send(`You cast ${encounterInfo.spell} for ${damageDealtByUser} damage!\nthe ${encounterInfo.name} has/have ${health} health left.`);
				}
			});
		}
	},
};
