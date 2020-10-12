const ForbiddenForest = require("../classes/ForbiddenForest.js");
const mazePositions = require("../jsonFiles/forbidden_forest/mazePositions.json");

module.exports = {
	name: "move",
	description: "Move around the forbidden forest.",
	async execute(message, args, bot) {
		if (!bot.functions.isMazeChannel(message.channel.name, message.member)) {
			return message.channel.send(`❌ | Use \`${bot.prefix}start\` to begin your journey!`);
		}

		let user = bot.userInfo.get(message.author.key);

		if (user.stats.fainted || user.mazeInfo.inFight) return;

		const curPos = parseFloat(user.mazeInfo.curPos).toFixed(2);

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
			message.member);

		if (!args[0]) return forbiddenForest.sendCurPosition(message.channel);
		if (!mazePositions[forbiddenForest.curPos].validMoves.includes(args[0])) {
			return message.channel.send("The trees look a little too thick that direction, better try a different way.");
		}

		forbiddenForest.syncLocations(message.guild.id, message.author.id);

		if (forbiddenForest.curPos == "34.12" && args[0] == "up") return forbiddenForest.centaurEncounter(message.member);

		if (args[0] == "up") forbiddenForest.moveUp();
		if (args[0] == "down") forbiddenForest.moveDown();
		if (args[0] == "left") forbiddenForest.moveLeft();
		if (args[0] == "right") forbiddenForest.moveRight();

		bot.log(`${message.member.displayName} moved ${args[0]} in the forbidden forest ${user.mazeInfo.curMaze} from ${forbiddenForest.lastPos} to ${forbiddenForest.curPos}`, "info");

		if (forbiddenForest.curPos == "34.12" && forbiddenForest.lastPos == "33.12") forbiddenForest.setLevelOne();
		if (forbiddenForest.curPos == "34.14" && forbiddenForest.lastPos == "35.14") return forbiddenForest.darkWizardEncounter();
		if (user.mazeInfo.ambushPositions.includes(forbiddenForest.curPos)) return forbiddenForest.spawnAmbush();
		if (user.mazeInfo.encounterPositions.includes(forbiddenForest.curPos)) return forbiddenForest.spawnEncounter();

		forbiddenForest.sendCurPosition();
	},
};
