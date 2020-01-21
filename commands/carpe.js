const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
	name: "carpe",
	description: "Fish for flying seahorses.",
	async execute(message, args, bot) {
		// Ensure the full command is !carpe retractum
		if (args[0] !== "retractum") return;

		if (!bot.isMazeChannel(message.channel.name, message.member)) return;

		// Get the user's data
		const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		// Ensure they've learned the command
		if (!user.studiedSpells.includes("carpe retractum")) return message.channel.send("You must learn carpe retractum to use this spell!");

		// Ensure they're at the correct spot in the maze
		if (user.mazeInfo.curPos.toString() !== "29.07") return;

		// Ensure they can still forage
		if (user.mazeInfo.dailyForagesLeft <= 0 && moment.tz("America/Los_Angeles").format("l") === user.mazeInfo.lastForage) return message.channel.send("It looks like this area has been picked clean already. We'd better wait a little bit to let it grow back.");

		// Reset their forages
		if (moment.tz("America/Los_Angeles").format("l") !== user.mazeInfo.lastForage) {
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 100, "mazeInfo.dailyForagesLeft");
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "mazeInfo.lastForage");
		}

		// Create the RNG number
		const chanceNumber = Math.random() * 100;

		// Fail responses and success responses
		const failResponses = ["They don't seem to be biting right now. Better keep at it.", "Waving your wand around like it's an actual fishing pole probably isn't helping.", "You catch a Flying Seahorse, but you stop to celebrate and it flies away.", "You catch a Flying Seahorse but a bear takes it out of your bag and runs off."];
		const successResponses = ["Nice one! You caught a Flying Seahorse and put it in your bag.", "After hours and hours of fishing you start to become frustrated when a Flying Seahorse jumps into your bag!"];

		// Increase their forages stat
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "forages");
		bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "mazeInfo.dailyForagesLeft");

		if (chanceNumber <= 10) { // They succeed
			message.reply(successResponses[Math.floor(Math.random() * successResponses.length)]);

			if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, "inventory.flyingSeahorses")) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, "inventory.flyingSeahorses");

			bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "inventory.flyingSeahorses");
		} else { // They fail
			message.channel.send(failResponses[Math.floor(Math.random() * failResponses.length)]);
		}
	},
};
