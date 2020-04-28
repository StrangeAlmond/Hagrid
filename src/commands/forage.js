// TODO: Test command once move command is updated.
const moment = require("moment-timezone");
const items = require("../jsonFiles/forbidden_forest/forageLocations.json");

module.exports = {
	name: "forage",
	description: "Forage for an item in the forbidden forest.",
	async execute(message, args, bot) {
		const user = bot.userInfo.get(message.author.key);

		if (user.stats.fainted) return;
		if (user.mazeInfo.inFight) return;
		if (!bot.functions.isMazeChannel(message.channel.name, message.member)) return;

		const today = moment.tz(bot.timezone).format("l");

		if (user.mazeInfo.dailyForagesLeft <= 0 && today == user.mazeInfo.lastForage) {
			return message.channel.send("It looks like this area has been picked clean already. We'd better wait a little bit to let it grow back.");
		}

		if (today != bot.userInfo.get(message.author.key, "mazeInfo.lastForage")) {
			bot.userInfo.set(message.author.key, 100, "mazeInfo.dailyForagesLeft");
			bot.userInfo.set(message.author.key, today, "mazeInfo.lastForage");
		}

		const forageItem = items.find(i => i.location == user.mazeInfo.curPos);
		if (!forageItem) return message.channel.send("There's nothing to forage for here!");

		const chanceNumber = Math.random() * 100;

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

		if (forageItem.name == "Wiggenweld Bark") {
			failResponses = [
				"You find an axe and use it to cut off some bark, but you miss and cut off your thumb",
				"You manage to pull off a chunk of Wiggenweld bark, but find that it's rotted out.",
				"You start to harvest some Wiggenweld bark but are chased away by BEES!",
				"You reach for a nearby axe to cut off some bark, but it's actually a port key. The other side is a bottomless pit."
			];
		}

		let successResponses = [
			`You successfully find ${forageItem.name} and put it in your bag.`,
			`After searching the forest for hours you finally find ${forageItem.name} and put it in your bag.`
		];

		if (forageItem.name == "Wiggenweld Bark") {
			successResponses = ["You find a nearby axe and use it successfully cut off a piece of Wiggenweld Bark"];
		}

		bot.userInfo.inc(message.author.key, "stats.forages");
		bot.userInfo.dec(message.author.key, "mazeInfo.dailyForagesLeft");

		if (user.mazeInfo.lastForage != today) {
			bot.userInfo.set(message.author.key, today, "mazeInfo.lastForage");
		}

		if (chanceNumber <= 10 || user.stats.activeEffects.some(e => e.type == "luck")) {
			if (!bot.userInfo.hasProp(message.author.key, `inventory.${forageItem.key}`)) {
				bot.userInfo.set(message.author.key, 0, `inventory.${forageItem.key}`);
			}

			bot.userInfo.inc(message.author.key, `inventory.${forageItem.key}`);
			message.reply(successResponses[Math.floor(Math.random() * successResponses.length)]);
		} else {
			const response = failResponses[Math.floor(Math.random() * failResponses.length)];
			message.channel.send(response);
		}
	},
};
