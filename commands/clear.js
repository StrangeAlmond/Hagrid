module.exports = {
	name: "clear",
	description: "Delete messages",
	aliases: ["deletrius", "evanesco"],
	async execute(message, args, bot) {
		// Check if they have the proper permissions to use this command
		if (!message.member.hasPermission("MANAGE_MESSAGES")) return;

		if (!args[0]) {
			// Tell them to specify how many messages to delete
			return bot.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
				username: "Argus Filch",
				avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
				deleteAfterUse: true
			});
		}

		// Delete their original message
		await message.delete();

		// Fetch 100 messages in that channel
		const messages = await message.channel.fetchMessages({
			limit: 100
		});

		if (args[0] === "bots") {
			// Delete messages from bots only

			if (isNaN(args[1])) {
				return bot.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const amount = parseInt(args[1]);

			if (amount > 100) {
				return bot.quickWebhook(message.channel, "You can only delete 100 messages at a time!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			// Get amount of messages
			let msgs = messages.splice(0, amount);

			// Filter them
			msgs = await msgs.filter(m => m.author.bot).array().slice(0, amount);
			// Delete them
			await message.channel.bulkDelete(msgs, true);

		} else if (args[0] === "links") {
			// Delete message that have links only

			if (isNaN(args[1])) {
				return bot.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const amount = parseInt(args[1]);

			if (amount > 100) {
				return bot.quickWebhook(message.channel, "You can only delete 100 messages at a time.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			// Get amount of messages
			let msgs = messages.splice(0, amount);
			// Filter them
			msgs = msgs.filter(m => m.content.includes("https://") || m.content.includes("http://")).array().slice(0, amount);
			// Delete them
			await message.channel.bulkDelete(msgs, true);
		} else if (message.mentions.members.first()) {
			// Delete messages from that user only
			const user = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]);

			if (isNaN(args[1])) {
				return bot.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const amount = parseInt(args[1]);

			if (amount > 100) {
				return bot.quickWebhook(message.channel, "You can only delete 100 messages at a time.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			// Get amount of messages
			let msgs = messages.splice(0, amount);
			// Filter them
			msgs = await msgs.filter(m => m.author.id === user.id).array().slice(0, amount);
			// Delete them
			await message.channel.bulkDelete(msgs, true);
		} else {
			// Clear messages

			if (isNaN(args[0])) {
				return bot.quickWebhook(message.channel, "Specify the amount of messages to delete!", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			const messagesToDelete = parseInt(args[0]);

			if (messagesToDelete > 100) {
				return bot.quickWebhook(message.channel, "You can only delete 100 messages at a time.", {
					username: "Argus Filch",
					avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
					deleteAfterUse: true
				});
			}

			if (messagesToDelete < 1) return;

			message.channel.bulkDelete(messagesToDelete, true)
				.catch(() => {
					bot.quickWebhook(message.channel, "Something went wrong, it's likely you tried to clear messages 14 days or older, try lowering the amount of messages you are clearing.", {
							username: "Argus Filch",
							avatar: "https://images.ctfassets.net/bxd3o8b291gf/hPVjS561mEisoyq6SECsK/1e444dfdaebe186874b1163b15b724f9/WB_F4_ArgusFilch_FilchLookingDisgruntled_HP4D-09902.jpg?w=320&h=320&fit=thumb&f=face&q=85",
							deleteAfterUse: true
						})

						.then(msg => msg.delete(5000));
				});
		}
	},
};
