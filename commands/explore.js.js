const Discord = require("discord.js");
const items = require("../mazeInfo/items.json");
const fs = require("fs");

module.exports = {
	name: "explore",
	description: "Explore your current location in the maze",
	async execute(message, args, bot) {
		if (!bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.itemPositions").includes(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos"))) return message.channel.send("You search the area but can't seem to find anything.");
		if (!bot.isMazeChannel(message.channel.name, message.member)) return;

		const itemObject = Object.values(items).find(i => i.tiles.includes(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos")));

		const item = itemObject.possibleItems[Math.floor(Math.random() * itemObject.possibleItems.length)];
		const amount = parseInt(item.split(/ +/)[0]);
		const itemKey = item.split(/ +/)[1];

		if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, itemKey)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, itemKey);

		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", amount, itemKey);

		let itemName = itemKey;
		if (itemName.includes("inventory.")) itemName = itemName.replace("inventory.", "");
		itemName = itemName.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
			return str.toUpperCase();
		});

		message.channel.send(`You discover a bag in the corner, someone must have left it behind. You open it and find ${amount} ${itemName}`);

		const possibleItemTiles = itemObject.tiles.filter(a => fs.readdirSync(`./mazeInfo/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(b => b.includes(a)));

		const itemsTiles = bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.itemPositions");
		const newTile = possibleItemTiles[Math.floor(Math.random() * possibleItemTiles.length)];

		// Remove this encounters tile and replace it with a new one
		itemsTiles.splice(itemsTiles.indexOf(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos")), 1, newTile);
	},
};
