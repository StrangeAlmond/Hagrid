const Discord = require("discord.js");

module.exports = {
	name: "wiki",
	description: "Sends the link to Hagrids wiki",
	async execute(message, args, bot) {
		message.channel.send("https://hagrid.fandom.com/wiki/Hagrid_Wiki");
	},
};
