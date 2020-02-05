const Discord = require("discord.js");
const TrainingSession = require("../classes/TrainingSession.js");
const beasts = require("../jsonFiles/training_sessions/beasts.json");

module.exports = {
	name: "spawn",
	description: "Spawn a dementor, boggart, chest, or training session.",
	async execute(message, args, bot) {
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;
		if (!args[0]) return message.channel.send("Specify what to spawn!");

		message.delete();

		if (args[0] === "dementor") {
			bot.spawnDementor(message.channel);

		} else if (args[0] === "boggart") {
			bot.spawnBoggart(message.channel);

		} else if (args[0] === "chest") {
			bot.spawnChest(message.channel);

		} else if (args[0] === "training") {
			const trainingChannel = message.guild.channels.find(c => c.name === "training-grounds");
			if (!trainingChannel) return;

			const trainingSession = new TrainingSession(bot, trainingChannel);

			if (beasts.find(b => b.spell.slice(1) === args[args.length - 1] || b.name.toLowerCase() === args[args.length - 1])) {
				console.log(args[args.length - 1]);
				trainingSession.spawnTrainingSession(args[args.length - 1]);
				return;
			}

			trainingSession.spawnTrainingSession();
		}
	},
};
