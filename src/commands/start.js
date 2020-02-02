const Discord = require("discord.js");
const encountersFile = require("../jsonFiles/forbidden_forest/encounters.json");
const ambushesFile = require("../jsonFiles/forbidden_forest/ambushes.json");
const itemsFile = require("../jsonFiles/forbidden_forest/items.json");
const fs = require("fs");

module.exports = {
	name: "start",
	description: "Create a maze channel for you to explore the maze in.",
	aliases: ["enter"],
	async execute(message, args, bot) {
		if (message.channel.name !== "forbidden-forest") return;

		// Get a list of the guild channel names
		const forbiddenForestCategoryName = "forbidden forest";
		const forbiddenForestCategory = message.guild.channels.find(c => c.name.toLowerCase() === forbiddenForestCategoryName.toLowerCase() && c.type === "category");
		const forbiddenForestChannels = forbiddenForestCategory.children;

		// If there isn't a channel made for them create one
		if (forbiddenForestChannels.some(c => c.name.includes(formattedName()))) return message.reply("You already have a maze session open!");

		// Create the channel
		const usersChannel = await message.guild.createChannel(`${formattedName()}-forbidden-forest`, {
			type: "text",

			permissionOverwrites: [{
					id: message.author.id,
					allow: ["VIEW_CHANNEL", "READ_MESSAGES", "READ_MESSAGE_HISTORY", "EMBED_LINKS"]
				},
				{
					id: "423184681765306368", // The muted role shouldn't be able to send messages in this channel
					deny: "SEND_MESSAGES"
				}, {
					id: message.guild.id,
					deny: ["VIEW_CHANNEL"]
				}, {
					id: bot.user.id,
					allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES", "MANAGE_WEBHOOKS", "EMBED_LINKS", "ATTACH_FILES"]
				}
			]

		});

		// Set the maze channel's category to the forbidden forest
		const category = await message.guild.channels.find(c => c.name.toLowerCase() === forbiddenForestCategoryName.toLowerCase() && c.type === "category");
		usersChannel.setParent(category);

		// Create five webhooks in their maze channel
		for (let i = 0; i < 5; i++) {
			usersChannel.createWebhook(bot.user.username, bot.user.displayAvatarURL);
		}

		usersChannel.createWebhook("Dark Wizard", "https://i.imgur.com/oXahnDf.png");

		// Tell them the channel has been created
		message.reply(`I have created a channel for you to use the maze commands in ${usersChannel}`);

		// Set their encounters and loot bag positions
		setEncounters();
		setAmbushes();
		setLoot();

		// Create the attachment for their current location
		let attachment;
		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.itemPositions").includes(bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos"))) {
			attachment = new Discord.Attachment(`../images/forbidden_forest/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active/Forest_${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos")}.png`, "map.png");
		} else {
			// Create an attachment for their current location
			attachment = new Discord.Attachment(`../images/forbidden_forest/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Inactive/Forest_${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curPos")}X.png`, "map.png");
		}

		// Send their current position and guide on how to navigate the maze to the newly created maze channel
		usersChannel.send(`Use \`${bot.prefix}move up\` (or \`${bot.prefix}u\`) to move up.Use \`${bot.prefix}move down\` (or \`${bot.prefix}d\`) to move down.\nUse \`${bot.prefix}move left\` (or \`${bot.prefix}l\`) to move left.\nUse \`${bot.prefix}move right\` (or \`${bot.prefix}r\`) to move right.\nUse \`${bot.prefix}leave\` to delete this channel when you are done.`, attachment);

		// Set the positions for encounters
		function setEncounters() {
			const encounters = encountersFile.filter(e => e.tiles.some(b => fs.readdirSync(`../images/forbidden_forest/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(b))));
			const tiles = encounters.map(e => e.tiles[Math.floor(Math.random() * e.tiles.length)]);

			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, tiles, "mazeInfo.encounterPositions");
		}

		// Set ambushes such as acromantuals or bandits
		function setAmbushes() {
			const ambushes = ambushesFile.filter(e => e.tiles.some(b => fs.readdirSync(`../images/forbidden_forest/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(f => f.includes(b))));
			const tiles = ambushes.map(a => a.tiles[Math.floor(Math.random() * a.tiles.length)]);

			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, tiles, "mazeInfo.ambushPositions");
		}

		// Set the positions for the loot bags
		function setLoot() {
			const items = Object.values(itemsFile).filter(a => a.tiles.some(b => fs.readdirSync(`../images/forbidden_forest/${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.curMaze")}/Active`).some(c => c.includes(b))));
			const tiles = items.map(i => i.tiles[Math.floor(Math.random() * i.tiles.length)]);

			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, tiles, "mazeInfo.itemPositions");
		}

		function formattedName() {
			return message.member.displayName.toLowerCase().replace(/[^a-z0-9+ ]+/gi, "").split(/ +/).join("-");
		}
	},
};
