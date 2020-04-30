const Discord = require("discord.js");

const bot = new Discord.Client({
	disabledEvents: ["TYPING_START"]
}); // Initiates a new discord client

const botconfig = require("./botconfig.json");
if(!botconfig.token || !botconfig.prefix || !botconfig.ownerId) {
	throw new Error("Invalid bot config file.");
}

const Enmap = require("enmap");

bot.userInfo = new Enmap({
	name: "users"
}); // Creates a database with the name users under the variable bot.userInfo
bot.guildInfo = new Enmap({
	name: "guilds"
});

const githubWebook = require("./utils/githubWebhook.js");
githubWebook(); // Monitors hagrid's github repo and automatically pulls from it when a change is detected

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

// Custom logger
const logger = require("./utils/logger.js");
bot.log = logger;

// Debugging
process.on("unhandledRejection", error => bot.log(`Uncaught Promise Rejection: ${error.stack}`, "error"));

let xpAlreadyUpdated = false;

// When a value is changed in the users database
bot.userInfo.changed((key, oldValue, newValue) => {
	if (!oldValue) return; // If there is no oldValue don't do anything
	if (newValue.stats.lastSpell.name === "buy") return; // If they're buying something ignore it
	if (xpAlreadyUpdated == true) return xpAlreadyUpdated = false;

	if (newValue.balance.knuts > oldValue.balance.knuts) { // if they've been given knuts then add to their lifetime earnings
		bot.userInfo.math(key, "+", newValue.balance.knuts - oldValue.balance.knuts, "lifetimeEarnings.knuts");
	} else if (newValue.balance.sickles > oldValue.balance.sickles) { // Same but for sickles
		bot.userInfo.math(key, "+", newValue.balance.sickles - oldValue.balance.sickles, "lifetimeEarnings.sickles");
	} else if (newValue.balance.galleons > oldValue.balance.galleons) { // Same but for galleons
		bot.userInfo.math(key, "+", newValue.balance.galleons - oldValue.balance.galleons, "lifetimeEarnings.galleons");
	}

	if (newValue.xp > oldValue.xp) { // If they've been given xp
		newValue.stats.lifetimeXp += newValue.xp - oldValue.xp; // Update their lifetime XP

		if (bot.guildInfo.get(newValue.guild, "events").includes("double-xp")) { // If theres a double xp event then double the xp they've been given
			newValue.stats.lifetimeXp += newValue.xp - oldValue.xp;
			newValue.xp += newValue.xp - oldValue.xp;

			xpAlreadyUpdated = true;
			bot.userInfo.set(`${newValue.guild}-${newValue.user}`, newValue.xp, "xp");
		}

		// Set their new XP
		bot.userInfo.set(`${newValue.guild}-${newValue.user}`, newValue.stats.lifetimeXp, "stats.lifetimeXp");
	}

});

bot.login(botconfig.token);
