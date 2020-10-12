const Discord = require("discord.js");

module.exports = {
	name: "start",
	description: "Create a maze channel for you to explore the maze in.",
	aliases: ["enter"],
	async execute(message, args, bot) {
		if (message.channel.name != "forbidden-forest") return;

		// Get a list of active maze forbidden forest channels
		const forestCategoryName = "forbidden forest";
		const forestCategory = message.guild.channels.cache.find(c =>
			c.name.toLowerCase() == forestCategoryName.toLowerCase() &&
			c.type == "category");
		const forestChannels = forestCategory.children;

		if (forestChannels.some(c => c.name.includes(formattedName()))) {
			return message.channel.send("You already have a maze session open!");
		}

		const mutedRole = message.guild.roles.cache.find(r => ["silenced", "muted"].includes(r.name.toLowerCase()));

		const usersChannel = await message.guild.channels.create(`${formattedName()}-forbidden-forest`, {
			type: "text",
			permissionOverwrites: [{
				id: message.guild.id,
				deny: ["VIEW_CHANNEL"]
			},
			{
				id: message.author.id,
				allow: ["VIEW_CHANNEL", "EMBED_LINKS"]
			}, {
				id: mutedRole.id,
				deny: "SEND_MESSAGES"
			}, {
				id: bot.user.id,
				allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "MANAGE_MESSAGES", "MANAGE_WEBHOOKS", "EMBED_LINKS", "ATTACH_FILES"]
			}]
		});

		// Set the maze channel's category to the forbidden forest
		const category = message.guild.channels.cache.find(c =>
			c.name.toLowerCase() == forestCategoryName.toLowerCase() &&
			c.type == "category");
		usersChannel.setParent(category, {
			lockPermissions: false
		});

		for (let i = 0; i < 5; i++) {
			usersChannel.createWebhook(bot.user.username, {
				avatar: bot.user.avatarURL()
			});
		}

		usersChannel.createWebhook("Dark Wizard", {
			avatar: "https://i.imgur.com/oXahnDf.png"
		});

		usersChannel.createWebhook("Centaur", {
			avatar: "https://i.imgur.com/z4n0Jcf.jpg"
		});

		// Tell them the channel has been created
		message.reply(`I have created a channel for you to use the maze commands in ${usersChannel}`);

		const userData = bot.userInfo.get(message.author.key);
		const curPos = userData.mazeInfo.curPos;
		const curMazeLevel = userData.mazeInfo.curMaze;

		// Create an attachment for their current location
		let attachment;
		if (bot.userInfo.get(message.author.key, "mazeInfo.itemPositions").includes(curPos)) {
			attachment = new Discord.MessageAttachment(`../images/forbidden_forest/${curMazeLevel}/Active/Forest_${curPos}.png`, "map.png");
		} else {
			attachment = new Discord.MessageAttachment(`../images/forbidden_forest/${curMazeLevel}/Inactive/Forest_${curPos}X.png`, "map.png");
		}

		usersChannel.send(`Use \`${bot.prefix}move up\` (or \`${bot.prefix}u\`) to move up.
Use \`${bot.prefix}move down\` (or \`${bot.prefix}d\`) to move down.
Use \`${bot.prefix}move left\` (or \`${bot.prefix}l\`) to move left.
Use \`${bot.prefix}move right\` (or \`${bot.prefix}r\`) to move right.
		
Use \`${bot.prefix}leave\` to delete this channel when you are done.`, attachment);

		function formattedName() {
			return message.member.displayName.toLowerCase().replace(/[^a-z0-9+ ]+/gi, "").split(/ +/).join("-");
		}
	},
};
