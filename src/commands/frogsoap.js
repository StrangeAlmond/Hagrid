module.exports = {
	name: "frogsoap",
	description: "Spawns frogs in the current channel.",
	async execute(message, args, bot) {
		if (bot.userInfo.get(message.author.key, "inventory.frogSpawnSoap") <= 0) {
			return message.channel.send("You don't have any frog spawn soap!");
		}

		bot.frogSoapChannels.push({
			channel: message.channel.id
		});

		bot.userInfo.inc(message.author.key, "stats.pranks");
		bot.userInfo.dec(message.author.key, "inventory.frogSpawnSoap");

		const messages = await message.channel.messages.fetch({
			limit: 25
		});

		let counter = 0;

		messages.forEach(m => m.react("🐸"));
		message.delete({ timeout: 2000 });

		setTimeout(() => {
			messages.forEach(m => m.clearReactions());
		}, 120000);

		const frogInterval = setInterval(() => {
			counter++;
			if (counter >= 25) {
				bot.frogSoapChannels.splice(bot.frogSoapChannels.findIndex(f => f.channel == message.channel.id), 1);
				return clearInterval(frogInterval);
			}

			bot.functions.quickWebhook(message.channel, "🐸", {
				username: "Frog",
				avatar: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/154/frog-face_1f438.png"
			});
		}, 7000);

	},
};
