module.exports = {
	name: "withdraw",
	description: "Withdraw galleons from Gringotts bank.",
	async execute(message, args, bot) {
		const gringottsRole = await message.member.roles.find(r => r.name.toLowerCase() === "gringotts");
		if (!gringottsRole) return;

		await bot.quickWebhook(message.channel, "You withdrew 146 galleons. That should be enough to cover all your school shopping", {
			username: "Gringotts Goblin",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/e/e3/Gringotts_Head_Goblin.jpg/revision/latest/scale-to-width-down/350?cb=20100214234030"
		});

		message.member.removeRole(gringottsRole);
	},
};
