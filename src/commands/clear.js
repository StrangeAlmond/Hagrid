module.exports = {
	name: "clear",
	description: "Purge a certain amount of messages from the current channel",
	aliases: ["deletrius", "evanesco"],
	async execute(message, args, bot) {
		if (!message.member.hasPermission("MANAGE_MESSAGES")) return;

		if (!args[0]) {
			return bot.functions.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
				username: "Argus Filch",
				avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
				deleteAfterUse: true
			});
		}

		await message.delete();

		const messages = await message.channel.messages.fetch({
			limit: 100
		});

		if (args[0] == "bots") {
			if (isNaN(args[1])) {
				return bot.functions.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const amount = parseInt(args[1]);

			if (amount > 100) {
				return bot.functions.quickWebhook(message.channel, "You can only delete 100 messages at a time!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			let msgs = messages.array().splice(0, amount);
			msgs = await msgs.filter(m => m.author.bot).slice(0, amount);
			await message.channel.bulkDelete(msgs, true);

		} else if (args[0] == "links") {
			if (isNaN(args[1])) {
				return bot.functions.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const amount = parseInt(args[1]);

			if (amount > 100) {
				return bot.functions.quickWebhook(message.channel, "You can only delete 100 messages at a time.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			let msgs = messages.array().splice(0, amount);
			msgs = msgs.filter(m => m.content.includes("https://") || m.content.includes("http://")).slice(0, amount);
			await message.channel.bulkDelete(msgs, true);
		} else if (message.mentions.members.first()) {
			const user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

			if (isNaN(args[1])) {
				return bot.functions.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const amount = parseInt(args[1]);

			if (amount > 100) {
				return bot.functions.quickWebhook(message.channel, "You can only delete 100 messages at a time.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			let msgs = messages.array().splice(0, amount);
			msgs = await msgs.filter(m => m.author.id == user.id).slice(0, amount);
			await message.channel.bulkDelete(msgs, true);
		} else {
			if (isNaN(args[0])) {
				return bot.functions.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const messagesToDelete = parseInt(args[0]);

			if (messagesToDelete > 100) {
				return bot.functions.quickWebhook(message.channel, "You can only delete 100 messages at a time.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			if (messagesToDelete < 1) return;

			message.channel.bulkDelete(messagesToDelete, true).catch(() => {
				bot.functions.quickWebhook(message.channel, "Something went wrong, it's likely you tried to clear messages 14 days or older, try lowering the amount of messages you are clearing.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				}).then(msg => msg.delete(5000));
			});
		}
	},
};
