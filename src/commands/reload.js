const Discord = require("discord.js");

module.exports = {
	name: "reload",
	description: "Reload a command.",
	async execute(message, args, bot) {
		if (message.author.id != bot.ownerId) return;
		if (!args[0]) return message.channel.send("Specify a command to reload!");

		const commandName = args[0];

		const command = bot.commands.get(commandName) || bot.commands.find(c => c.aliases && c.aliases.includes(commandName));
		if (!command) {
			return message.channel.send("❌ | That command does not exist")
				.then(msg => msg.delete({ timeout: 5000 }));
		}

		delete require.cache[require.resolve(`./${command.name}.js`)];
		bot.commands.delete(command.name);
		const props = require(`./${command.name}.js`);

		bot.commands.set(command.name, props);
		message.channel.send(`The ${bot.prefix}${command.name} command has been reloaded.`)
			.then(msg => msg.delete({ timeout: 5000 }) && message.delete({ timeout: 5000 }));
	},
};
