module.exports = {
	name: "frogsoap",
	description: "Spawns frogs in the current channel.",
	async execute(message, args, bot) {
		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "inventory.frogSpawnSoap") <= 0) return message.channel.send("You don't have any frog spawn soap!");

		bot.frogSoapChannels.push({
			channel: message.channel.id
		});

		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.pranks");
		bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.frogSpawnSoap");

		const messages = await message.channel.fetchMessages({
			limit: 25
		});

		let counter = 0;

		messages.forEach(msg => msg.react("🐸"));
		message.delete(2000);

		setTimeout(() => {
			messages.forEach(msg => {
				msg.clearReactions();
			});
		}, 120000);

		const frogInterval = setInterval(() => {
			counter++;
			if (counter >= 25) {
				bot.frogSoapChannels.splice(bot.frogSoapChannels.findIndex(f => f.channel === message.channel.id), 1);
				return clearInterval(frogInterval);
			}

			bot.quickWebhook(message.channel, "🐸", {
				username: "Frog",
				avatar: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/154/frog-face_1f438.png"
			});
		}, 7000);

	},
};
