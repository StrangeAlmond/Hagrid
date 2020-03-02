module.exports = {
	name: "optout",
	description: "Opt out of training session notifications.",
	aliases: ["opt-out", "optin", "opt-in"],
	async execute(message, args, bot) {

		// Get the user's data from the database
		const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		// If the user is trying to opt out but they've already opted out send a message saying they've already opted out
		if (message.content.split(/ +/)[0].toLowerCase().includes("out") && !user.settings.trainingSessionAlerts) return message.channel.send("You have already opted out of training session pings!");
		// If the user is trying to opt in but they've already opted in send a message saying they've already opted in
		if (message.content.split(/ +/)[0].toLowerCase().includes("in") && user.settings.trainingSessionAlerts) return message.channel.send("You have already opted in to training session pings!");

		// If the user is opting out of pings
		if (message.content.split(/ +/)[0].toLowerCase().includes("out")) {
			// Set the users trainingSessionPings value to false
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, false, "settings.trainingSessionAlerts");

			// Hagrid says
			message.channel.send("You have opted out of training session pings.");

			// Array of the user's studied spells where the user has a role with it's name matching the spell's name
			const usersStudiedSpells = user.studiedSpells.filter(s => message.member.roles.find(r => r.name.toLowerCase() === s));

			// For each studied spell
			usersStudiedSpells.forEach(spell => {
				// Remove the role from the user after 1500 seconds
				setTimeout(() => {
					message.member.removeRole(message.guild.roles.find(r => r.name.toLowerCase() === spell));
				}, 1500);
			});

		} else if (message.content.split(/ +/)[0].toLowerCase().includes("in")) { // Otherwise if the user is opting in to pings
			// Set their trainingSessionPings to false
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, true, "settings.trainingSessionAlerts");

			// Hagrid says
			message.channel.send("You have opted in to training session pings.");

			// Array of the user's studied spells where the user has a role with it's name matching the spell's name
			const usersStudiedSpells = user.studiedSpells.filter(s => !message.member.roles.find(r => r.name.toLowerCase() === s) && message.guild.roles.find(r => r.name.toLowerCase() === s));

			// For each studied spell
			usersStudiedSpells.forEach(spell => {
				setTimeout(() => {
					message.member.addRole(message.guild.roles.find(r => r.name.toLowerCase() === spell));
				}, 1500);
			});
		}
	},
};
