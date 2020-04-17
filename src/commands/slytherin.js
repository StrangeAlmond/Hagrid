module.exports = {
	name: "slytherin",
	description: "Assign yourself to a hogwarts house.",
	aliases: ["gryffindor", "hufflepuff", "ravenclaw"],
	async execute(message, args, bot) {
		if (!message.channel.name.includes("sorting")) return;
		if (!message.member.roles.cache.find(u => u.name.toLowerCase() == "unsorted")) return;

		const house = message.content.toLowerCase().slice(bot.prefix.length).split(/ +/)[0];

		const houseRole = message.guild.roles.cache.find(r => r.name.toLowerCase() == house);
		const unsortedRole = message.guild.roles.cache.find(u => u.name.toLowerCase() == "unsorted");

		await message.member.roles.add(houseRole);
		await message.member.roles.remove(unsortedRole);

		bot.functions.quickWebhook(message.channel, `I choose... ${house.charAt(0).toUpperCase() + house.slice(1)}!`, {
			username: "Sorting Hat",
			avatar: "../images/webhook_avatars/sortingHat.png"
		});

		const houseEmoji = message.guild.emojis.cache.find(e => e.name.toLowerCase() == house);
		if (!houseEmoji) return;

		await message.react(houseEmoji);
	},
};
