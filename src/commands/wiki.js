module.exports = {
	name: "wiki",
	description: "Get the link for Hagrid's wiki.",
	async execute(message, args, bot) {
		message.channel.send("https://hagrid.fandom.com/wiki/Hagrid_Wiki");
	},
};
