const Discord = require("discord.js");

module.exports = {
	name: "points",
	description: "Give house points to house or user.",
	aliases: ["givepoints"],
	async execute(message, args, bot) {
		const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
		const staffRoles = ["prefect", "heads of house", "head girl", "head boy", "deputy headmaster", "headmaster"];

		if (!message.member.roles.some(r => staffRoles.includes(r.name.toLowerCase()))) return;

		const points = parseInt(args[0]);
		const user = bot.getUserFromMention(args[1], message.guild) || message.guild.members.get(args[1]);
		const house = houses.find(h => args[1] === h) || houses.find(h => user.roles.some(r => r.name.toLowerCase() === h));
		const reason = args.slice(2).join(" ");

		if (!points || isNaN(args[0])) return errorMessage(`Specify the amount of points to give! Proper Usage: \`${bot.prefix}points <points> <@member/slytherin/gryffindor/hufflepuff/ravenclaw> <reason>\``);
		if (!user && !house) return errorMessage(`Specify the user/house you'd like to give points to! Proper Usage: \`${bot.prefix}points <points> <@member/slytherin/gryffindor/hufflepuff/ravenclaw> <reason>\``);
		if (!reason) return errorMessage(`Specify the reason you're giving these points! Proper Usage: \`${bot.prefix}points <points> <@member/slytherin/gryffindor/hufflepuff/ravenclaw> <reason>\``);

		const roleOrder = { // Roles (values) that a role (key) can't give points to
			"prefect": ["heads of house", "deputy headmaster", "headmaster"],
			"heads of house": ["deputy headmaster", "headmaster"],
			"deputy headmaster": ["headmaster"]
		};

		const staffRole = message.member.roles.find(r => Object.keys(roleOrder).includes(r.name.toLowerCase()));

		if (roleOrder[staffRole] && user && user.roles.some(r => roleOrder[staffRole].includes(r.name.toLowerCase()))) return errorMessage("You can't give house points to a role above you!");

		const pointsToGive = Math.abs(points);

		if (pointsToGive === 0) return errorMessage("You can't give 0 points!");

		if (user) {
			bot.userInfo.math(`${message.guild.id}-${user.id}`, "+", pointsToGive, "stats.housePoints");
		}

		bot.guildInfo.math(message.guild.id, "+", pointsToGive, `housePoints.${house}`);

		const embed = new Discord.RichEmbed()
			.setAuthor(`${pointsToGive} points ${points > 0 ? "To" : "From"} ${house.charAt(0).toUpperCase() + house.slice(1)} ${user ? `and ${user.displayName}` : ""}!`)
			.setDescription(`**Moderator:** ${message.member}\n**Reason:** ${reason}`)
			.setColor(message.guild.roles.find(r => r.name.toLowerCase() === house).hexColor)
			.setTimestamp();

		const houseCupChannel = message.guild.channels.find(c => c.name.includes("house"));

		const channels = [message.channel, houseCupChannel];

		channels.forEach(channel => {
			bot.quickWebhook(channel, embed, {
				username: "House Cup",
				avatar: "./images/webhook_avatars/houseCup.png"
			});
		});

		function errorMessage(msg) {
			return bot.quickWebhook(message.channel, msg, {
				username: "House Cup",
				avatar: "./images/webhook_avatars/houseCup.png"
			});
		}
	},
};
