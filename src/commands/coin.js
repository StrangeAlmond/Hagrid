module.exports = {
	name: "coin",
	description: "Flip a coin.",
	aliases: ["flipcoin", "coinflip"],
	async execute(message, args, bot) {
		const choices = ["Heads", "Tails"];
		const choice = choices[Math.floor(Math.random() * choices.length)];
		message.channel.send(`I pick ${choice}!`);
	},
};
