const Discord = require("discord.js");

module.exports = {
	name: "avada",
	description: "The killing curse",
	async execute(message, args, bot) {
		// If they're a staff member don't run the command.
		if (["prefect", "heads of house", "head girl", "head boy", "deputy headmaster", "headmaster"].some(r => message.member.roles.some(role => r.toLowerCase() === role.name.toLowerCase()))) return;

		// If the message is actually 'avada kedavra' then issue the command
		if (args[0] === "kedavra") {
			// Tell them they're a dissapointment
			message.channel.send("Your spelled failed, and its a good thing it did. -20 points.");

			// Find the users house
			const house = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"].find(h => message.member.roles.some(r => r.name.toLowerCase() === h.toLowerCase()));
			if (!house) return;

			// Smack them across the face with -20 points
			await bot.guildInfo.math(message.guild.id, "-", 20, `housePoints.${house}`);
			await bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 20, "stats.housePoints");

			// Find the #house-cup channel
			const channel = message.guild.channels.find(c => c.name === "house-cup");
			if (!channel) return;

			// Create the embed for removing their points and send it to the house cup channel
			const memberEmbed = new Discord.RichEmbed()
				.setAuthor(`Minus 20 points from ${house} and ${message.member.displayName}!`)
				.addField("Moderator", "Albus Dumbledore", true)
				.addField("Reason", "Tried to use a forbidden curse", true)
				.setColor(message.member.displayHexColor)
				.setFooter(`${message.member.displayName} tried to use a forbidden curse`)
				.setTimestamp();

			// Send the embed using the house cup webhook.
			return bot.quickWebhook(channel, memberEmbed, {
				username: "House Cup",
				avatar: "./images/webhook_avatars/houseCup.png",
				deleteAfterUse: true
			});

		}
	},
};