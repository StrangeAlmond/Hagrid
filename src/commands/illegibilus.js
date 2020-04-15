module.exports = {
	name: "illegibilus",
	description: "Make text unreadable.",
	async execute(message, args, bot) {
		if (!args[0]) return message.channel.send("❌ | Please specify something to reverse!");

		const reversedString = args.join(" ").split("").reverse().join("");
		message.channel.send(reversedString);
	},
};
