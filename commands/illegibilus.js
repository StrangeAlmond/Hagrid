const Discord = require("discord.js");

module.exports = {
	name: "illegibilus",
	description: "make text unreadable!",
	async execute(message, args, bot) {
		// Ensure they specify something to reverse
		if (!args[0]) return message.channel.send("❌ | Please specify something to reverse!");

		// Reverse the string
		const reversedString = args.join(" ").split("").reverse().join("");

		// Send the reversed string
		message.channel.send(reversedString);
	},
};
