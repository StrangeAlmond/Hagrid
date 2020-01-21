const Discord = require("discord.js");

module.exports = {
	name: "coin",
	description: "Flip a coin.",
	aliases: ["flipcoin", "coinflip"],
	async execute(message, args, bot) {
		// Choices
		const choices = ["Heads", "Tails"];
		// Pick a choice
		const choice = choices[Math.floor(Math.random() * (choices.length - 0)) + 0];
		// Send the result
		message.channel.send(`I pick ${choice}!`);
	},
};
