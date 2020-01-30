const Discord = require("discord.js");

const bot = new Discord.Client({
	disabledEvents: ["TYPING_START"]
});

const botconfig = require("./botconfig.json");

const Enmap = require("enmap");

bot.userInfo = new Enmap({
	name: "users"
});

bot.guildInfo = new Enmap({
	name: "guilds"
});

const githubWebook = require("./utils/githubWebhook.js");
githubWebook();

const fs = require("fs");

// Create a discord collection for commands and get an array of all the commands.
bot.commands = new Discord.Collection();
const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

// Get an array of all the events
const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

// Add each command to the commands collection
for (const file of commands) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.name, command);
}

// When an event runs, give it it's required variables
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	const eventName = file.split(".")[0];

	bot.on(eventName, event.bind(null, bot));
	delete require.cache[require.resolve(`./events/${file}`)];
}

const logger = require("./utils/logger.js");

bot.log = logger;

// Debugging
process.on("unhandledRejection", error => bot.log(`Uncaught Promise Rejection: ${error.stack}`, "error"));

bot.userInfo.changed((key, oldValue, newValue) => {
	if (!oldValue) return;
	if (newValue.stats.lastSpell.name === "buy") return;

	if (newValue.balance.knuts > oldValue.balance.knuts) {
		bot.userInfo.math(key, "+", newValue.balance.knuts - oldValue.balance.knuts, "lifetimeEarnings.knuts");
	} else if (newValue.balance.sickles > oldValue.balance.sickles) {
		bot.userInfo.math(key, "+", newValue.balance.sickles - oldValue.balance.sickles, "lifetimeEarnings.sickles");
	} else if (newValue.balance.galleons > oldValue.balance.galleons) {
		bot.userInfo.math(key, "+", newValue.balance.galleons - oldValue.balance.galleons, "lifetimeEarnings.galleons");
	}

	if (newValue.xp > oldValue.xp) {
		newValue.stats.lifetimeXp += newValue.xp - oldValue.xp;

		if (bot.guildInfo.get(newValue.guild, "events").includes("double-xp")) {
			newValue.stats.lifetimeXp += newValue.xp - oldValue.xp;
			newValue.xp += newValue.xp - oldValue.xp;
		}

		bot.userInfo.set(`${newValue.guild}-${newValue.user}`, newValue.stats.lifetimeXp, "stats.lifetimeXp");
	}

});

bot.login(botconfig.token);
