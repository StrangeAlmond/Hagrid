const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
	name: "forage",
	description: "Forage for mushrooms",
	async execute(message, args, bot) {
		const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		if (user.stats.fainted) return;
		if (user.mazeInfo.inFight) return;
		if (!bot.isMazeChannel(message.channel.name, message.member)) return;

		if (user.mazeInfo.dailyForagesLeft <= 0 && moment.tz("America/Los_Angeles").format("l") === user.mazeInfo.lastForage) return message.channel.send("It looks like this area has been picked clean already. We'd better wait a little bit to let it grow back.");

		if (moment.tz("America/Los_Angeles").format("l") !== bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.lastForage")) {
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 100, "mazeInfo.dailyForagesLeft");
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "mazeInfo.lastForage");
		}

		const items = [{
				name: "a Bursting Mushroom",
				key: "burstingMushrooms",
				location: "38.08"
			},
			{
				name: "Mistletoe Berries",
				key: "mistletoeBerries",
				location: "42.16"
			},
			{
				name: "Sprig of Mint",
				key: "sprigOfMint",
				location: "42.08"
			},
			{
				name: "Wiggenweld Bark",
				key: "wiggenweldBark",
				location: "36.12"
			},
			{
				name: "a pinch of Unicorn Horn",
				key: "pinchOfUnicornHorn",
				location: "35.13"
			},
			{
				name: "Purple Thorn Blossoms",
				key: "purpleThornBlossoms",
				location: "33.01"
			},
			{
				name: "Arm Bones",
				key: "armBone",
				location: "21.09"
			},
			{
				name: "Fire Seeds",
				key: "fireSeeds",
				location: "24.08"
			}
		];

		const forageItem = items.find(i => i.location === user.mazeInfo.curPos);
		if (!forageItem) return message.channel.send("There's nothing to forage for here!");

		// Create the RNG number
		const chanceNumber = Math.random() * 100;

		// Array of responses to pick from when the forage fails
		let failResponses = [
			`You failed to collect ${forageItem.name}.`,
			`You spot ${forageItem.name} but an unknown creature runs by and takes it.`,
			`You spot ${forageItem.name} but fall down on top of it and it breaks.`,
			`You fail to collect ${forageItem.name}.`,
			`You search the forest but you can't seem to find ${forageItem.name}.`,
			`You try to find ${forageItem.name} but get lost in the dark forest.`,
			`You try to find ${forageItem.name} but a centaur arrives and wastes your time with talk about the stars.`,
			`You pick up ${forageItem.name} but it crumbles in your hands.`,
			`You picked up ${forageItem.name}, but it was actually a port key. The other end was a bottomless pit.`
		];

		if (forageItem.name === "Wiggenweld Bark") {
			failResponses = ["You find an axe and use it to cut off some bark, but you miss and cut off your thumb", "You manage to pull off a chunk of Wiggenweld bark, but find that it's rotted out.", "You start to harvest some Wiggenweld bark but are chased away by BEES!", "You reach for a nearby axe to cut off some bark, but it's actually a port key. The other side is a bottomless pit."];
		}

		// Array of responses to pick from when the forage works
		let successResponses = [
			`You successfully find ${forageItem.name} and put it in your bag.`,
			`After searching the forest for hours you finally find ${forageItem.name} and put it in your bag.`
		];

		if (forageItem.name === "Wiggenweld Bark") {
			successResponses = ["You find a nearby axe and use it successfully cut off a piece of Wiggenweld Bark"];
		}

		// Increase their forages stat
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.forages");
		bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "mazeInfo.dailyForagesLeft");

		if (user.mazeInfo.lastForage !== moment.tz("America/Los_Angeles").format("l")) {
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "mazeInfo.lastForage");
		}

		if (chanceNumber <= 10) {
			if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${forageItem.key}`)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, `inventory.${forageItem.key}`);

			bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, `inventory.${forageItem.key}`);
			message.reply(successResponses[Math.floor(Math.random() * successResponses.length)]);
		} else {
			// Forage Fail
			const response = await failResponses[Math.floor(Math.random() * failResponses.length)];
			message.channel.send(response);
		}
	},
};
