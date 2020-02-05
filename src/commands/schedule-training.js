const Discord = require("discord.js");
const beasts = require("../jsonFiles/training_sessions/beasts.json");
const moment = require("moment-timezone");

module.exports = {
	name: "schedule-training",
	description: "Schedule a training session.",
	aliases: ["schedule-training-session"],
	async execute(message, args, bot) {
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		args = args.join(" ").split(/, +/);

		if (!args[0]) return message.channel.send(`Specify when to spawn a training session! Proper Usage: \`${bot.prefix}schedule-training <year-month-date hh:mm:ss>, [spell]\``);

		const time = args[0];
		let filter = args[1];

		if (filter && filter.startsWith(bot.prefix)) filter = filter.slice(bot.prefix.length);

		const timeFormat = "YYYY-MM-DD HH:mm:ss";

		if (!moment.tz(time, timeFormat, bot.timezone).isValid()) return message.channel.send(`Invalid time! Proper Usage: \`${bot.prefix}schedule-training <year-month-date hh:mm:ss>, [spell]\``);

		const timeObject = moment.tz(time, timeFormat, bot.timezone);

		if (Date.now() > timeObject.valueOf()) return message.channel.send(`You must specify a time in the future! Proper Usage: \`${bot.prefix}schedule-training <year-month-date hh:mm:ss>, [spell]\``);

		const object = {
			time: timeObject.valueOf(),
			id: message.id
		};

		if (filter && beasts.some(b => b.spell.slice(1) === filter || b.name.toLowerCase() == filter)) object.filter = filter;

		bot.guildInfo.push(message.guild.id, object, "scheduledTrainingSessions");

		message.channel.send(`Got it! I have scheduled a training session for ${timeObject.format("dddd, MMMM Do YYYY, h:mm:ss a")}`);
	},
};
