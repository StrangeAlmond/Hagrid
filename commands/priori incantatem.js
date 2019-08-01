module.exports = {
	name: "priori",
	description: "Display a users last spell",
	async execute(message, args, bot) {
		if (args[0] !== "incantatem") return;

		const staffRoles = ["headmaster", "deputy headmaster", "heads of house", "auror", "support staff", "prefect", "head girl", "head boy"];
		if (!staffRoles.some(r => message.member.roles.find(i => i.name.toLowerCase() === r))) return;

		const spellUser = bot.getUserFromMention(args[1], message.guild) || message.guild.members.get(args[1]);
		if (!args[1]) return message.channel.send("❌ | Specify who you'd like to user this spell on!");
		if (!spellUser) return message.channel.send("❌ | I couldn't find that user");

		message.channel.send(`${spellUser}'s last spell was \`${bot.prefix}${bot.userInfo.get(`${message.guild.id}-${spellUser.id}`, "stats.lastSpell.name")} ${bot.userInfo.get(`${message.guild.id}-${spellUser.id}`, "stats.lastSpell.args").join(" ")}\``);
	},
};
