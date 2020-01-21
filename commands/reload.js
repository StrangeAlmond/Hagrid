const Discord = require("discord.js");

module.exports = {
	name: "reload",
	description: "Reload a command.",
	async execute(message, args, bot) {
		if (message.author.id !== "356172624684122113") return;

		if (!args[0]) return message.channel.send("Specify a command to reload!");

		const commandName = args[0];

		const command = bot.commands.get(commandName) || bot.commands.find(c => c.aliases && c.aliases.includes(commandName));
		if (!command) return message.reply("❌ | That command does not exist").then(msg => msg.delete(5000));

		await delete require.cache[require.resolve(`./${command.name}.js`)];
		await bot.commands.delete(command.name);
		const props = await require(`./${command.name}.js`);

		await bot.commands.set(command.name, props);
		message.reply(`The ${bot.prefix}${command.name} command has been reloaded.`).then(msg => msg.delete(5000) && message.delete(5000));
	},
};
