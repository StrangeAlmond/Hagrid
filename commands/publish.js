module.exports = {
	name: "publish",
	description: "Publish a newspaper",
	async execute(message, args, bot) {
		const permittedRoles = ["headmaster", "deputy headmaster"];
		if (!message.member.roles.some(r => permittedRoles.includes(r.name.toLowerCase()))) return;

		const publishChannel = message.guild.channels.find(c => c.name.includes("daily") && c.name.includes("prophet"));

		if (!publishChannel) return;

		if (!args[0]) {
			return bot.quickWebhook(message.channel, "Specify something to publish!", {
				username: "Rita Skeeter",
				avatar: "./images/ritaSkeeter.png"
			});
		}

		const messageContent = message.content.slice(8).trim();

		bot.quickWebhook(message.channel, "Your message has been published.", {
			username: "Rita Skeeter",
			avatar: "./images/webhook avatars/ritaSkeeter.jpg"
		});

		bot.quickWebhook(publishChannel, messageContent, {
			username: "Rita Skeeter",
			avatar: "./images/webhook avatars/ritaSkeeter.jpg"
		});
	}
};
