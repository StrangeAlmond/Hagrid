module.exports = {
	name: "slytherin",
	description: "Assign yourself to a hogwarts house.",
	aliases: ["gryffindor", "hufflepuff", "ravenclaw"],
	async execute(message, args, bot) {
		// Make sure the command is being used in #sorting-ceremony
		if (!message.channel.name.includes("sorting")) return;

		// Make sure they aren't sorted (this shouldn't be an issue though because those who are already sorted don't have write perms for #sorting-ceremony)
		if (!message.member.roles.find(u => u.name.toLowerCase() === "unsorted")) return;

		const house = message.content.toLowerCase().slice(bot.prefix.length).split(/ +/)[0];

		// Grab the house role and the unsorted role
		const houseRole = message.guild.roles.find(r => r.name.toLowerCase() === house);
		const unsortedRole = message.guild.roles.find(u => u.name.toLowerCase() === "unsorted");

		// Add the house role and remove the unsorted role
		await message.member.addRole(houseRole);
		await message.member.removeRole(unsortedRole);

		// Sorting hat chooses <house>
		bot.quickWebhook(message.channel, `I choose... ${house.charAt(0).toUpperCase() + house.slice(1)}!`, {
			username: "Sorting Hat",
			avatar: "./images/webhook_avatars/sortingHat.png"
		});

		// Get the emoji for that house
		const houseEmoji = message.guild.emojis.find(e => e.name.toLowerCase() === house);
		if (!houseEmoji) return;

		// React with gryffindor emoji
		await message.react(houseEmoji);
	},
};
