const items = require("../jsonFiles/forbidden_forest/items.json");
const fs = require("fs");

module.exports = {
	name: "explore",
	description: "Check for any hidden items at your current position in the maze",
	async execute(message, args, bot) {
		if (!bot.isMazeChannel(message.channel.name, message.member)) return; // Ensure the current channel is a maze channel
		if (!bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.itemPositions").includes(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos"))) return message.channel.send("You search the area but can't seem to find anything.");

		const itemObject = Object.values(items).find(i => i.tiles.includes(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos"))); // Get the item's object

		const item = itemObject.possibleItems[Math.floor(Math.random() * itemObject.possibleItems.length)]; // Get the item
		let amount = parseInt(item.split(/ +/)[0]); // Get the item amount
		const itemKey = item.split(/ +/)[1]; // Get the item key

		// Ensure they have this key in their inventory
		if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, itemKey)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, itemKey);

		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "stats.activeEffects").some(e => e.type == "luck")) {
			const chance = Math.floor(Math.random() * 100);

			if (chance <= 60) { // 60% chance to get an extra item
				amount++;
			}
		}

		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, itemKey); // Give them the item

		let itemName = itemKey.split(".");
		itemName = itemName[itemName.length - 1];
		itemName = itemName.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
			return str.toUpperCase();
		}); // Formats the item key into a user-readable item name

		message.channel.send(`You discover a bag in the corner, someone must have left it behind. You open it and find ${amount} ${itemName}`);

		// Possible item tiles to relocate this item
		const possibleItemTiles = itemObject.tiles.filter(a => fs.readdirSync(`../images/forbidden_forest/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(b => b.includes(a)));

		// Get the user's current item tiles
		const itemsTiles = bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.itemPositions");
		// Pick a new tile for the item at random
		const newTile = possibleItemTiles[Math.floor(Math.random() * possibleItemTiles.length)];

		// Remove this item tile and replace it with the new one
		itemsTiles.splice(itemsTiles.indexOf(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos")), 1, newTile);
	},
};
