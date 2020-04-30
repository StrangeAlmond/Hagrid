const Discord = require("discord.js");

module.exports = {
	name: "avada",
	description: "The killing curse",
	async execute(message, args, bot) {
		const staffRoles = ["prefect", "heads of house", "head girl", "head boy", "deputy headmaster", "headmaster"];
		if (staffRoles.some(r => message.member.roles.cache.some(role => r.toLowerCase() == role.name.toLowerCase()))) return;

		if (args[0] == "kedavra") {
			message.channel.send("Your spell failed, and its a good thing it did. -20 points.");

			const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
			const house = houses.find(h => message.member.roles.cache.some(r => r.name.toLowerCase() == h.toLowerCase()));
			if (!house) return;

			bot.guildInfo.math(message.guild.id, "-", 20, `housePoints.${house}`);
			bot.userInfo.math(message.author.key, "-", 20, "stats.housePoints");

			const channel = message.guild.channels.find(c => c.name == "house-cup");
			if (!channel) return;

			const memberEmbed = new Discord.MessageEmbed()
				.setAuthor(`Minus 20 points from ${house} and ${message.member.displayName}!`)
				.addField("Reason", "Tried to use a forbidden curse", true)
				.setColor(message.member.displayHexColor)
				.setFooter(`${message.member.displayName} tried to use a forbidden curse`)
				.setTimestamp();

			return bot.quickWebhook(channel, memberEmbed, {
				username: "House Cup",
				avatar: "./images/webhook_avatars/houseCup.png",
				deleteAfterUse: true
			});

		}
	},
};
