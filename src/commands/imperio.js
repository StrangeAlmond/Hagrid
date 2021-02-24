const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "imperio",
	description: "The imperius curse.",
	async execute(message, args, bot) {
		const staffRoles = ["prefect", "heads of house", "head girl", "head boy", "deputy headmaster", "headmaster"];
		if (staffRoles.some(r => message.member.roles.cache.some(role => r.toLowerCase() == role.name.toLowerCase()))) return;

		message.channel.send("Your spell failed, and its a good thing it did. -20 points.");

		const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
		const house = houses.find(h => message.member.roles.cache.some(r => r.name.toLowerCase() == h.toLowerCase()));
		if (!house) return;

		db.guildInfo.math(message.guild.id, "-", 20, `housePoints.${house}`);
		db.userInfo.math(message.author.key, "-", 20, "stats.housePoints");

		const channel = message.guild.channels.cache.find(c => c.name == "house-cup");
		if (!channel) return;

		const memberEmbed = new Discord.MessageEmbed()
			.setAuthor(`Minus 20 points from ${house} and ${message.member.displayName}!`)
			.addField("Reason", "Tried to use a forbidden curse", true)
			.setColor(message.member.displayHexColor)
			.setFooter(`${message.member.displayName} tried to use a forbidden curse`)
			.setTimestamp();

		return bot.functions.quickWebhook(channel, memberEmbed, {
			username: "House Cup",
			avatar: "./images/webhook_avatars/houseCup.png",
			deleteAfterUse: true
		});
	},
};
