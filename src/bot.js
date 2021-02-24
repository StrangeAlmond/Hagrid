const Discord = require("discord.js");
const fs = require("fs");
const logger = require("./utils/logger.js");
const botconfig = require("./botconfig.json");
const githubWebook = require("./utils/githubWebhook.js");

if (!botconfig.token || !botconfig.prefix || !botconfig.ownerId || !botconfig.timezone) {
  throw new Error("Invalid bot config file.");
}

const bot = new Discord.Client({
  disabledEvents: ["TYPING_START"]
}); // Initiates a new discord client

bot.blacklistedWords = require("./jsonFiles/blacklistedWords.json");
bot.commands = new Discord.Collection();

githubWebook();

const commands = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

const eventFiles = fs
  .readdirSync("./events")
  .filter(file => file.endsWith(".js"));

for (const file of commands) {
  const command = require(`./commands/${file}`);
  bot.commands.set(command.name, command);
}

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  const eventName = file.split(".")[0];

  bot.on(eventName, event.bind(null, bot));
  delete require.cache[require.resolve(`./events/${file}`)];
}

bot.log = logger;

// Debugging
process.on("unhandledRejection", error =>
  bot.log(`Uncaught Promise Rejection: ${error.stack}`, "error")
);

let xpAlreadyUpdated = false;

const db = require("./utils/db.js");

// When a value is changed in the users database
db.userInfo.changed((key, oldValue, newValue) => {
  if (!oldValue) return; // If there is no oldValue don't do anything
  if (newValue.stats.lastSpell.name == "buy") return; // If they're buying something ignore it
  if (xpAlreadyUpdated) return (xpAlreadyUpdated = false);

  if (newValue.balance.knuts > oldValue.balance.knuts) {
    // if they've been given knuts then add to their lifetime earnings
    db.userInfo.math(
      key,
      "+",
      newValue.balance.knuts - oldValue.balance.knuts,
      "lifetimeEarnings.knuts"
    );
  } else if (newValue.balance.sickles > oldValue.balance.sickles) {
    // Same but for sickles
    db.userInfo.math(
      key,
      "+",
      newValue.balance.sickles - oldValue.balance.sickles,
      "lifetimeEarnings.sickles"
    );
  } else if (newValue.balance.galleons > oldValue.balance.galleons) {
    // Same but for galleons
    db.userInfo.math(
      key,
      "+",
      newValue.balance.galleons - oldValue.balance.galleons,
      "lifetimeEarnings.galleons"
    );
  }

  if (newValue.xp > oldValue.xp) {
    // If they've been given xp
    newValue.stats.lifetimeXp += newValue.xp - oldValue.xp; // Update their lifetime XP

    if (db.guildInfo.get(newValue.guild, "events").includes("double-xp")) {
      // If theres a double xp event then double the xp they've been given
      newValue.stats.lifetimeXp += newValue.xp - oldValue.xp;
      newValue.xp += newValue.xp - oldValue.xp;

      xpAlreadyUpdated = true;
      db.userInfo.set(`${newValue.guild}-${newValue.user}`, newValue.xp, "xp");
    }

    // Set their new XP
    db.userInfo.set(
      `${newValue.guild}-${newValue.user}`,
      newValue.stats.lifetimeXp,
      "stats.lifetimeXp"
    );
  }
});

bot.login(botconfig.token);
