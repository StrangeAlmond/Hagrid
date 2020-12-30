module.exports = {
	name: "opt",
	description: "Allows you to opt out/in of/to training session notifications.",
	async execute(message, args, bot) {
		const user = bot.userInfo.get(message.author.key);

		if (!args[0]) return message.channel.send(`Proper Usage: \`${bot.prefix}opt out/in\``);
		if (args[0] == "out" && !user.settings.trainingSessionAlerts) {
			return message.channel.send("You have already opted out of training session pings!");
		}

		if (args[0] == "in" && user.settings.trainingSessionAlerts) {
			return message.channel.send("You have already opted in to training session pings!");
		}

		if (args[0] == "out") {
			bot.userInfo.set(message.author.key, false, "settings.trainingSessionAlerts");
			message.channel.send("You have opted out of training session pings.");

			const usersStudiedSpells = user.studiedSpells.filter(s => message.member.roles.cache.find(r => r.name.toLowerCase() == s));
			usersStudiedSpells.forEach(spell => {
				setTimeout(() => {
					message.member.roles.remove(message.guild.roles.cache.find(r => r.name.toLowerCase() == spell));
				}, 1500);
			});

		} else if (args[0] == "in") {
			bot.userInfo.set(message.author.key, true, "settings.trainingSessionAlerts");
			message.channel.send("You have opted in to training session pings.");

			const usersStudiedSpells = user.studiedSpells.filter(s => !message.member.roles.cache.find(r => r.name.toLowerCase() == s) &&
				message.guild.roles.cache.find(r => r.name.toLowerCase() == s));

			usersStudiedSpells.forEach(spell => {
				setTimeout(() => {
					message.member.roles.add(message.guild.roles.cache.find(r => r.name.toLowerCase() == spell));
				}, 1500);
			});
		}
	},
};
