module.exports = {
	name: "publish",
	description: "Publish a newspaper.",
	async execute(message, args, bot) {
		const permittedRoles = ["headmaster", "deputy headmaster"];
		if (!message.member.roles.cache.some(r => permittedRoles.includes(r.name.toLowerCase()))) return;

		const publishChannel = message.guild.channels.cache.find(c => c.name.includes("daily") && c.name.includes("prophet"));
		if (!publishChannel) return;

		if (!args[0]) {
			return bot.functions.quickWebhook(message.channel, "Specify something to publish!", {
				username: "Rita Skeeter",
				avatar: "./images/ritaSkeeter.png"
			});
		}

		const messageContent = message.content.slice(8).trim();

		bot.functions.quickWebhook(message.channel, "Your message has been published.", {
			username: "Rita Skeeter",
			avatar: "./images/webhook_avatars/ritaSkeeter.jpg"
		});

		bot.functions.quickWebhook(publishChannel, messageContent, {
			username: "Rita Skeeter",
			avatar: "./images/webhook_avatars/ritaSkeeter.jpg"
		});
	}
};
