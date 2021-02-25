const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
	name: "divine",
	description: "Ask the divine crystal ball a question.",
	aliases: ["8ball", "orb"],
	async execute(message, args, bot) {
		if (!db.userInfo.get(message.author.key, "studiedSpells").includes("divine")) return;
		if (!args[0]) return message.reply("Ask the divine ball a question!");

		const replies = [
			"It is certain",
			"It is decidedly so",
			"Without a doubt",
			"Yes definitely",
			"You may rely on it",
			"You can count on it",
			"As I see it, yes",
			"Most likely",
			"Outlook good",
			"Yes",
			"Signs point to yes",
			"Absolutely",
			"Reply hazy, try again",
			"Ask again later",
			"Better not tell you now",
			"Cannot predict now",
			"Concentrate and ask again",
			"Don't count on it",
			"My reply is no",
			"My sources say no",
			"Outlook not so good",
			"Very doubtful",
			"Chances aren't good"
		];

		const answer = replies[Math.floor(Math.random() * replies.length)];
		const question = args.join(" ");

		if (["what is the meaning of life", "what's the meaning of life"].some(i => question.includes(i))) {
			return bot.functions.quickWebhook(message.channel, "42.", {
				username: "Crystal Ball",
				avatar: "https://c1-ebgames.eb-cdn.com.au/merchandising/images/packshots/59a0f76962bc44ddbc3cb980111ce991_Large.png",
				deleteAfterUse: true
			});
		}

		const answerEmbed = new Discord.MessageEmbed()
			.setTitle("Crystal Ball")
			.setColor(message.member.displayHexColor)
			.addField("Question", question)
			.addField("Answer", answer)
			.setFooter("Crystal Ball", "https://c1-ebgames.eb-cdn.com.au/merchandising/images/packshots/59a0f76962bc44ddbc3cb980111ce991_Large.png")
			.setTimestamp(new Date());

		bot.functions.quickWebhook(message.channel, answerEmbed, {
			username: "Crystal Ball",
			avatar: "https://c1-ebgames.eb-cdn.com.au/merchandising/images/packshots/59a0f76962bc44ddbc3cb980111ce991_Large.png",
			deleteAfterUse: true
		});
	},
};
