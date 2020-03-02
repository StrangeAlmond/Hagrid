module.exports = {
	name: "say",
	description: "Send's a copy of the user's message as Hagrid.",
	async execute(message, args, bot) {
		if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;

		args = message.content.split(/ +/);
		args.shift();

		await message.delete();
		message.channel.send(args.join(" "));
	},
};
