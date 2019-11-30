const Discord = require("discord.js");

module.exports = {
	name: "houses",
	description: "See the different houses",
	async execute(message, args, bot) {

		const houses = ["Slytherin", "Gryffindor", "Hufflepuff", "Ravenclaw"];

		houses.sort((a, b) => message.guild.roles.find(r => r.name.toLowerCase() === b.toLowerCase()).members.size - message.guild.roles.find(r => r.name.toLowerCase() === a.toLowerCase()).members.size);

		// Create the embed for the houses
		const housesEmbed = new Discord.RichEmbed()
			.setAuthor("Houses")
			.setColor(message.member.displayHexColor)
			.setTimestamp();

		houses.forEach(house => {
			housesEmbed.addField(house, message.guild.roles.find(r => r.name.toLowerCase() === house.toLowerCase()).members.size);
		});

		// Send the embed
		bot.quickWebhook(message.channel, housesEmbed, {
			username: "Sorting Hat",
			avatar: "./images/webhook avatars/sortingHat.png",
			deleteAfterUse: true
		});
	},
};
