const botconfig = require("../botconfig.json");

module.exports = {
	name: "eval",
	description: "An owner-only command, this command evaluates the given code.",
	aliases: ["evaluate"],
	async execute(message, args, bot) {
		if (message.author.id != bot.ownerId) return;

		try {
			const code = message.content.slice(6);
			const ev = require("util").inspect(eval(code));

			if (ev.includes(botconfig.token)) ev.replace(/botConfig.token/gi, "Bot-Token-Replacement");

			if (ev.length > 1850 || code.length > 1850) {
				return message.channel.send("This worked but the response code is too long to send").then(msg => {
					msg.delete({ timeout: 60000 });
					message.delete({ timeout: 120000 });
				});
			}

			message.channel.send(`Input:\n\n${code}\n\nResponse:\n\n${ev}`, {
				code: "js"
			}).then(msg => {
				msg.delete({ timeout: 60000 });
				message.delete({ timeout: 120000 });
			});
		} catch (err) {
			message.channel.send(`Error:\n\n${err}`, {
				code: "js"
			}).then(msg => {
				msg.delete({ timeout: 60000 });
				message.delete({ timeout: 120000 });
			});
		}

	},
};
