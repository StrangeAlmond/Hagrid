// TODO: Test command once move command is updated.
const items = require("../jsonFiles/forbidden_forest/items.json");
const fs = require("fs");

module.exports = {
	name: "explore",
	description: "Check for any hidden items at your current position in the maze",
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);

		if (!bot.functions.isMazeChannel(message.channel.name, message.member)) return;
		if (!userData.mazeInfo.itemPositions.includes(userData.mazeInfo.curPos)) {
			return message.channel.send("You search the area but can't seem to find anything.");
		}

		const itemObject = Object.values(items).find(i => i.tiles.includes(userData.mazeInfo.curPos));

		const item = itemObject.possibleItems[Math.floor(Math.random() * itemObject.possibleItems.length)];
		let amount = parseInt(item.split(/ +/)[0]);
		const itemKey = item.split(/ +/)[1];

		if (!userData[itemKey]) bot.userInfo.set(message.author.key, 0, itemKey);

		if (userData.stats.activeEffects.some(e => e.type == "luck")) {
			const chance = Math.floor(Math.random() * 100);

			if (chance <= 60) {
				amount++;
			}
		}

		bot.userInfo.math(message.author.key, "+", amount, itemKey);

		let itemName = itemKey.split(".");
		itemName = itemName[itemName.length - 1];
		itemName = itemName.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());

		message.channel.send(`You discover a bag in the corner, someone must have left it behind. You open it and find ${amount} ${itemName}`);

		const possibleItemTiles = itemObject.tiles
			.filter(a => fs.readdirSync(`../images/forbidden_forest/${userData.mazeInfo.curMaze}/Active`)
				.some(b => b.includes(a)));

		const itemsTiles = userData.mazeInfo.itemPositions;
		const newTile = possibleItemTiles[Math.floor(Math.random() * possibleItemTiles.length)];

		itemsTiles.splice(itemsTiles.indexOf(userData.mazeInfo.curPos), 1, newTile);
		bot.userInfo.set(message.author.key, itemsTiles, "mazeInfo.itemPositions");
	},
};
