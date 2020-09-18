const moment = require("moment-timezone");

module.exports = {
	name: "carpe",
	description: "Fish for flying seahorses.",
	async execute(message, args, bot) {
		if (args[0] != "retractum") return;

		if (!bot.functions.isMazeChannel(message.channel.name, message.member)) return;

		const user = bot.userInfo.get(message.author.key);
		const today = moment.tz("America/Los_Angeles").format("l");

		if (!user.studiedSpells.includes("carpe retractum")) {
			return message.channel.send("You must learn carpe retractum to use this spell!");
		}

		if (user.mazeInfo.curPos.toString() != "29.07") return;
		if (user.mazeInfo.dailyForagesLeft <= 0 && today == user.mazeInfo.lastForage) {
			return message.channel.send("It looks like this area has been picked clean already. We'd better wait a little bit to let it grow back.");
		}

		if (today != user.mazeInfo.lastForage) {
			bot.userInfo.set(message.author.key, 100, "mazeInfo.dailyForagesLeft");
			bot.userInfo.set(message.author.key, today, "mazeInfo.lastForage");
		}

		const chanceNumber = Math.random() * 100;
		const failResponses = ["They don't seem to be biting right now. Better keep at it.", "Waving your wand around like it's an actual fishing pole probably isn't helping.", "You catch a Flying Seahorse, but you stop to celebrate and it flies away.", "You catch a Flying Seahorse but a bear takes it out of your bag and runs off."];
		const successResponses = ["Nice one! You caught a Flying Seahorse and put it in your bag.", "After hours and hours of fishing you start to become frustrated when a Flying Seahorse jumps into your bag!"];

		bot.userInfo.dec(message.author.key, "mazeInfo.dailyForagesLeft");
		bot.userInfo.inc(message.author.key, "stats.forages");

		if (chanceNumber <= 10) {
			message.reply(successResponses[Math.floor(Math.random() * successResponses.length)]);

			if (!bot.userInfo.hasProp(message.author.key, "inventory.flyingSeahorses")) bot.userInfo.set(message.author.key, 0, "inventory.flyingSeahorses");
			bot.userInfo.inc(message.author.key, "inventory.flyingSeahorses");
		} else {
			message.channel.send(failResponses[Math.floor(Math.random() * failResponses.length)]);
		}
	},
};
