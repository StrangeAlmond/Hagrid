module.exports = async (bot, reaction, user) => {
	if (user.bot) return;
	const message = reaction.message;
	const args = message.content.toLowerCase().split(/ +/);

	const guildData = bot.guildInfo.get(message.guild.id);

	// Allows a user to use a training token by clicking on the ⚔ emoji
	if (reaction.emoji.name === "⚔" && message.author.id === bot.user.id && message.embeds.length > 0 && message.embeds[0].description.toLowerCase().includes(guildData.spawns.find(s => s.type === "trainingSession").beast.name.toLowerCase())) {
		const userData = bot.userInfo.get(`${message.guild.id}-${user.id}`);
		const member = message.guild.members.get(user.id);
		const channel = message.guild.channels.find(c => c.name === "training-grounds");

		if (!userData.inventory.trainingTokens || userData.inventory.trainingTokens <= 0) {
			message.channel.send("You don't have any training tokens!").then(m => m.delete(5000));
			return message.reactions.find(r => r.emoji.name === "⚔").remove(user);
		}

		if (member.roles.find(r => r.name.toLowerCase() === "training")) {
			message.channel.send("You have already used a training token!").then(m => m.delete(5000));
			return message.reactions.find(r => r.emoji.name === "⚔").remove(user);
		}

		const role = message.guild.roles.find(r => r.name.toLowerCase() === "training");
		if (!role) return;

		member.addRole(role);

		bot.userInfo.dec(`${message.guild.id}-${user.id}`, "inventory.trainingTokens");
		bot.userInfo.set(`${message.guild.id}-${user.id}`, Date.now(), "trainingTokenUse");

		return message.channel.send(`${member}, You have used one training token to gain access to <#${channel.id}>. This will expire in one hour!`).then(m => m.delete(5000));
	}

	if (!message.channel.name.includes("hospital")) return;

	if (reaction.emoji.name === "✅") { // Revive a fainted user
		const reviver = message.guild.members.get(user.id);
		const revivee = bot.getUserFromMention(args[0], message.guild);

		if (reviver.id === revivee.id) {
			message.reactions.find(r => r.emoji.name === "✅").remove(reviver);

			const msg = await bot.quickWebhook(message.channel, `${reviver}, you can't revive yourself!`, {
				username: "Madam Pomfrey",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
			});

			return msg.delete(5000);
		}

		if (!bot.userInfo.hasProp(`${message.guild.id}-${reviver.id}`, "inventory.revivePotion") || bot.userInfo.get(`${message.guild.id}-${reviver.id}`, "inventory.revivePotion") <= 0) {
			message.reactions.find(r => r.emoji.name === "✅").remove(reviver);
			const msg = await bot.quickWebhook(message.channel, `${reviver}, you don't have any revive potions!`, {
				username: "Madam Pomfrey",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
			});

			return msg.delete(5000);
		}

		if (!bot.userInfo.get(`${message.guild.id}-${revivee.id}`, "stats.fainted")) return message.delete();

		reviveUser(revivee);

		bot.userInfo.dec(`${message.guild.id}-${revivee.id}`, "inventory.revivePotion");

		const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
		const house = houses.find(h => reviver.roles.find(r => r.name.toLowerCase() === h.toLowerCase()));
		if (!house) return;

		bot.guildInfo.inc(message.guild.id, `housePoints.${house}`);
		bot.userInfo.inc(`${message.guild.id}-${reviver.id}`, "stats.housePoints");

		const msg = await bot.quickWebhook(message.channel, `${reviver}, You have revived ${revivee} and recieved 1 house point!`, {
			username: "Madam Pomfrey",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
		});

		message.delete();
		msg.delete(10000);

	} else if (reaction.emoji.name.toLowerCase() === "potion") { // Cure a poisoned user
		const curer = message.guild.members.get(user.id);
		const curee = bot.getUserFromMention(args[0], message.guild);

		if (!bot.userInfo.get(`${message.guild.id}-${curee.id}`, "stats.poisonedObject")) return message.delete();

		const poisonType = bot.userInfo.get(`${message.guild.id}-${curee.id}`, "stats.poisonedObject").type;

		const requiredPotion = `antidoteTo${poisonType.charAt(0).toUpperCase() + poisonType.slice(1)}Poisons`;

		if (!bot.userInfo.hasProp(`${message.guild.id}-${curer.id}`, `inventory.${requiredPotion}`) || bot.userInfo.get(`${message.guild.id}-${curer.id}`, `inventory.${requiredPotion}`) <= 0) {
			message.reactions.find(r => r.emoji.name.toLowerCase() === "potion").remove(curer);
			const msg = await bot.quickWebhook(message.channel, `${curer}, you don't have any antidote to ${poisonType} poisons potions!`, {
				username: "Madam Pomfrey",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
			});

			return msg.delete(5000);
		}

		cureUser(curee);

		bot.userInfo.dec(`${message.guild.id}-${curer.id}`, `inventory.${requiredPotion}`);

		let msgContent = "";

		if (curer.id === curee.id) {
			msgContent = "You have cured yourself";
		} else {
			msgContent = `${curer}, You have cured ${curee} and recieved 1 house point!`;

			const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
			const house = houses.find(h => curer.roles.find(r => r.name.toLowerCase() === h.toLowerCase()));
			if (!house) return;

			bot.guildInfo.inc(message.guild.id, `housePoints.${house}`);
			bot.userInfo.inc(`${message.guild.id}-${curer.id}`, "stats.housePoints");
		}

		const msg = await bot.quickWebhook(message.channel, msgContent, {
			username: "Madam Pomfrey",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
		});

		message.delete();
		msg.delete(10000);
	}

	async function reviveUser(toRevive) {
		bot.userInfo.set(`${message.guild.id}-${toRevive.id}`, false, "stats.fainted");
		bot.userInfo.set(`${message.guild.id}-${toRevive.id}`, 1, "stats.health");

		const hospitalChannel = await message.guild.channels.find(c => c.name.includes("hospital"));
		const messages = await hospitalChannel.fetchMessages();

		const msg = messages.find(m => m.content.includes(toRevive.id) && m.content.toLowerCase().includes("revive"));
		if (msg) msg.delete();
	}

	async function cureUser(toCure) {
		bot.userInfo.set(`${message.guild.id}-${toCure.id}`, null, "stats.poisonedObject");

		const hospitalChannel = await message.guild.channels.find(c => c.name.includes("hospital"));
		const messages = await hospitalChannel.fetchMessages();

		const msg = messages.find(m => m.content.includes(toCure.id) && m.content.toLowerCase().includes("poison"));
		if (msg) msg.delete();
	}
};
