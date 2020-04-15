const Discord = require("discord.js");

module.exports = {
	name: "houses",
	description: "View hogwart's different houses and their statistics.",
	async execute(message, args, bot) {

		const houses = ["Slytherin", "Gryffindor", "Hufflepuff", "Ravenclaw"];

		houses.sort((a, b) => message.guild.roles.cache
			.find(r => r.name.toLowerCase() == b.toLowerCase())
			.members.size - message.guild.roles.cache.find(r => r.name.toLowerCase() == a.toLowerCase()).members.size);

		const housesEmbed = new Discord.MessageEmbed()
			.setAuthor("Houses")
			.setColor(message.member.displayHexColor)
			.setTimestamp();

		houses.forEach(house => {
			housesEmbed.addField(house, message.guild.roles.cache.find(r => r.name.toLowerCase() == house.toLowerCase()).members.size);
		});

		bot.functions.quickWebhook(message.channel, housesEmbed, {
			username: "Sorting Hat",
			avatar: "../images/webhook_avatars/sortingHat.png",
			deleteAfterUse: true
		});
	},
};
