const jokes = require("../jsonFiles/jokes.json");

module.exports = {
	name: "joke",
	description: "Get a random joke from peeves.",
	aliases: ["randjoke"],
	async execute(message, args, bot) {
		const joke = jokes[Math.floor(Math.random() * (jokes.length - 0 + 1)) + 0];

		bot.functions.quickWebhook(message.channel, joke.joke, {
			username: "Peeves",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/9/9c/Peeves-PM-17-10-17.gif/revision/latest?cb=20171018234135"
		});

		setTimeout(() => {
			bot.functions.quickWebhook(message.channel, joke.answer, {
				username: "Peeves",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/9/9c/Peeves-PM-17-10-17.gif/revision/latest?cb=20171018234135",
				deleteAfterUse: true
			});
		}, 2000);
	},
};
