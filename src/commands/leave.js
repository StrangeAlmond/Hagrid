module.exports = {
	name: "leave",
	description: "Deletes your maze channel.",
	aliases: ["exit", "done", "delete"],
	async execute(message, args, bot) {
		// Make sure they initiated this channel
		if (!message.channel.name.includes(message.member.displayName.toLowerCase().replace(/[^a-z0-9+ ]+/gi, "").split(/ +/).join("-")) && message.author.id !== "137269251361865728") return;
		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "mazeInfo.inFight")) return;

		// Delete the channel
		message.channel.delete();
	},
};
