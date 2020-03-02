module.exports = {
	name: "rule",
	description: "View a list of Hogwarts rules.",
	aliases: ["rules", "decree", "decrees"],
	async execute(message, args, bot) {
		if (!args[0]) {
			const rules = [
				"**1 No cheating.** No scraping/spoofing/multiaccounting. Just don't do it. Cheaters will be expelled.",
				"**2 Be respectful.** This is a game and we’re all here to have fun. If you're having a problem with another student or faculty member, please let your prefect know.",
				"**3 Keep it PG.** We have early years in here. No profanity or discussion of drugs/alcohol on school grounds.",
				"**4 Polyjuice potion is on the banned list.** No impersonating others, your discord and in game name need to match.",
				"**5 No spamming.** and no encouragement of spamming. Spam is a silly muggle food.",
				"**6 Be respectful of private property.** Some areas are off limits to young witches and wizards, no trespassing.",
				"**7 No Advertising.** Do not advertise your product/service without prior approval from Hogwarts Staff."
			];

			return message.channel.send(rules.join("\n"));
		}

		const rules = ["1", "2", "3", "4", "5", "6", "7"];
		if (!rules.includes(args[0])) return;

		message.channel.send({
			files: [`../images/rules/rule${rules.find(r => r === args[0])}.jpg`]
		});
	},
};
