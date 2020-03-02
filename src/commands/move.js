const ForbiddenForest = require("../classes/ForbiddenForest.js");
const mazePositions = require("../jsonFiles/forbidden_forest/mazePositions.json");

module.exports = {
	name: "move",
	description: "Move around the forbidden forest.",
	async execute(message, args, bot) {
		// Ensure they own this channel
		if (!bot.isMazeChannel(message.channel.name, message.member)) return message.channel.send(`❌ | Use \`${bot.prefix}start\` to begin your journey!`);

		// Get the user's data from the database
		let user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		// Ensure they haven't fainted and aren't currently in a fight
		if (user.stats.fainted || user.mazeInfo.inFight) return;

		// Get their current position and format it
		const curPos = parseFloat(user.mazeInfo.curPos).toFixed(2);

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

		const forbiddenForest = new ForbiddenForest(bot,
			message.channel,
			curPos,
			user.mazeInfo.lastPos,
			user.mazeInfo.curMaze,
			user.mazeInfo.encounterPositions,
			user.mazeInfo.ambushPositions,
			user.mazeInfo.itemPositions,
			message.guild.id,
			message.author.id,
			message.member,
			webhook);

		// If they didn't specify a direction to move send their current position
		if (!args[0]) return forbiddenForest.sendCurPosition(message.channel);

		// If the possible moves for that location don't include the move they specified
		if (!mazePositions[forbiddenForest.curPos].validMoves.includes(args[0])) return webhook.send("The trees look a little too thick that direction, better try a different way.");

		// If the user is in level 2 but their encounter/item/ambush tiles are setup for level 1 change it to level 2 tiles and vice versa
		forbiddenForest.syncLocations(message.guild.id, message.author.id);

		// If they're trying to enter level 2 execute the centaur function
		if (forbiddenForest.curPos === "34.12" && args[0] == "up") return forbiddenForest.centaurEncounter(message.member);

		// Change their position based on their movement
		if (args[0] === "up") forbiddenForest.moveUp();
		if (args[0] === "down") forbiddenForest.moveDown();
		if (args[0] === "left") forbiddenForest.moveLeft();
		if (args[0] === "right") forbiddenForest.moveRight();

		bot.log(`${message.member.displayName} moved ${args[0]} in the forbidden forest ${user.mazeInfo.curMaze} from ${forbiddenForest.lastPos} to ${forbiddenForest.curPos}`, "info");

		// If they're traveling from the 2nd level to the 1st level set their curMaze to the 1st level
		if (forbiddenForest.curPos === "34.12" && forbiddenForest.lastPos === "33.12") forbiddenForest.setLevelOne();

		// If they're visiting the dark wizard execute the darkWizard function
		if (forbiddenForest.curPos === "34.14" && forbiddenForest.lastPos === "35.14") return forbiddenForest.darkWizardEncounter();
		// If they've entered an ambush positon spawn the ambush
		if (user.mazeInfo.ambushPositions.includes(forbiddenForest.curPos)) return forbiddenForest.spawnAmbush();
		// If they've entered an encounter position spawn the encounter
		if (user.mazeInfo.encounterPositions.includes(forbiddenForest.curPos)) return forbiddenForest.spawnEncounter();

		// Send their current position
		forbiddenForest.sendCurPosition();
	},
};
