const Discord = require("discord.js");

module.exports = {
	name: "divine",
	description: "Ask the crystal ball a question",
	aliases: ["8ball", "orb"],
	async execute(message, args, bot) {
		// Make sure they have learned the spell
		if (!bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "studiedSpells").includes("divine")) return;
		if (!args[0]) return message.reply("Ask the divine ball a question!");

		// Replies
		const replies = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", "You can count on it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Absolutely", "Reply hazy, try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful", "Chances aren't good", "Not today", "Go ahead!", "No way!", "Ask a friend", "Why bother?", "Of course!", "Forget it"];
		// Random Answer
		const answer = replies[Math.floor(Math.random() * replies.length)];

		// The question they asked
		const question = args.join(" ");

		// Make an embed with the question and answer
		const BallEmbed = new Discord.RichEmbed()
			.setTitle("Crystal Ball")
			.setColor(message.member.displayHexColor)
			.addField("Question", question)
			.addField("Answer", answer)
			.setFooter("Crystal Ball", "https://c1-ebgames.eb-cdn.com.au/merchandising/images/packshots/59a0f76962bc44ddbc3cb980111ce991_Large.png")
			.setTimestamp(new Date());

		// Send it
		bot.quickWebhook(message.channel, BallEmbed, {
			username: "Crystal Ball",
			avatar: "https://c1-ebgames.eb-cdn.com.au/merchandising/images/packshots/59a0f76962bc44ddbc3cb980111ce991_Large.png",
			deleteAfterUse: true
		});
	},
};
