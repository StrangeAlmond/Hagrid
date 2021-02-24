const db = require("../utils/db.js");
const functions = require("../utils/functions.js");
const quickWebhook = require("../utils/quickWebhook.js");
const botconfig = require("../botconfig.json");
const TrainingSession = require("../classes/TrainingSession.js");
const prefix = botconfig.prefix;

module.exports = async bot => {
  // Variables
  bot.frogSoapChannels = [];
  bot.prefix = prefix;
  bot.ownerId = botconfig.ownerId;
  bot.timezone = botconfig.timezone;

  // Functions
  bot.functions = functions;
  bot.functions.quickWebhook = quickWebhook;

  bot.user.setActivity("Just Started, Sorry for the downtime!");
  bot.log(`${bot.user.username} is online!\nUser: ${bot.user.username}\nSnowflake: ${bot.user.id}\nGuilds: ${bot.guilds.cache.size}\nUsers: ${bot.users.cache.size}\nPrefix: ${bot.prefix}`, "info");

  functions.playOST(bot, bot.channels.cache.get(botconfig.ostChannel));

  const statuses = ["I am what I am, an’ I’m not ashamed", "Playing quidditch", "Grooming my beard", "What's coming will come, and we'll meet it when it does", "Ah, go boil yer heads, both of yeh", "Mad and hairy? You wouldn't be talking about me, now, would you?", ""];

  setInterval(async () => {
    bot.user.setActivity(statuses[Math.floor(Math.random() * statuses.length)]);
  }, 300000);

  const usersInFight = db.userInfo.array().filter(u => u.mazeInfo.inFight);
  usersInFight.forEach(user => { // Takes users out of their fights from before the bot restarted
    db.userInfo.set(`${user.guild}-${user.user}`, false, "mazeInfo.inFight");
  });

  const faintedUsers = db.userInfo.array().filter(u => u.stats.fainted);
  faintedUsers.forEach(user => { // Revives fainted users at midnight
    setTimeout(async () => {
      if (!db.userInfo.get(`${user.guild}-${user.user}`, "stats.fainted")) return;

      db.userInfo.set(`${user.guild}-${user.user}`, false, "stats.fainted");
      db.userInfo.set(`${user.guild}-${user.user}`, 1, "stats.health");

      const hospitalChannel = await bot.guilds.cache.get(user.guild).channels.cache.find(c => c.name.includes("hospital-wing"));
      const messages = await hospitalChannel.messages.fetch();

      const msg = messages.find(m => m.content.includes(user.user) && m.content.toLowerCase().includes("fainted"));
      if (msg) msg.delete().catch(console.error);
    }, bot.functions.timeUntilMidnight());
  });

  setInterval(() => {
    const guilds = db.guildInfo.array();
    const users = db.userInfo.array();

    guilds.forEach(guild => {

      if (guild.scheduledTrainingSessions.some(s => Date.now() >= s.time)) { // Spawns scheduled training sessions
        const trainingSession = guild.scheduledTrainingSessions.find(ts => Date.now() >= ts.time);

        guild.scheduledTrainingSessions.splice(guild.scheduledTrainingSessions.findIndex(s =>
          s.id == trainingSession.id), 1);
        db.guildInfo.set(guild.guild, guild.scheduledTrainingSessions, "scheduledTrainingSessions");

        const trainingChannel = bot.guilds.cache.get(guild.guild).channels.cache.find(c => c.name == "training-grounds");
        if (trainingChannel) {
          const trainingSessionObject = new TrainingSession(bot, trainingChannel);
          trainingSessionObject.spawnTrainingSession(trainingSession.filter);
        }
      }

      if (guild.spawns.some(s => s.type == "trivia" && (Date.now() - s.time) >= 600000)) { // Deletes expired trivia questions
        const triviaQuestion = guild.spawns.find(s => s.type == "trivia" && (Date.now() - s.time) >= 600000);
        if (triviaQuestion) {
          const channel = bot.channels.cache.get(triviaQuestion.channel);
          if (channel) {
            guild.spawns.splice(
              guild.spawns.findIndex(s =>
                s.channel == triviaQuestion.channel && s.type == triviaQuestion.type), 1
            );

            db.guildInfo.set(guild.guild, guild.spawns, "spawns");
            bot.functions.quickWebhook(channel, "This trivia question has expired.", triviaQuestion.webhookObject);
          }
        }
      }
    });

    const reminderUsers = users.filter(u => u.reminders.length > 0);
    reminderUsers.forEach(u => { // Sends user's their reminders
      const reminder = u.reminders.find(r => Date.now() > r.time);
      const user = bot.users.cache.get(u.user);

      if (reminder && user) {
        u.reminders.splice(
          u.reminders.findIndex(r => r.reminder == reminder.reminder && r.time == reminder.time), 1
        );

        db.userInfo.set(`${u.guild}-${u.user}`, u.reminders, "reminders");
        user.send(reminder.reminder);
      }
    });

    const flooPowderUsers = users.filter(u => u.trainingTokenUse && (Date.now() - u.trainingTokenUse) > 3600000);
    flooPowderUsers.forEach(user => { // Removes expired floo powder roles
      const guild = bot.guilds.cache.get(user.guild);
      if (guild) {
        const role = guild.roles.cache.find(r => r.name.toLowerCase() == "training");

        if (role) {
          const u = guild.members.cache.get(user.user);
          u.roles.remove(role);

          db.userInfo.set(`${user.guild}-${user.user}`, null, "trainingTokenUse");
        }
      }
    });

    const mazeChannels = bot.channels.cache
      .filter(c => c.type == "text" && c.name.endsWith("-forbidden-forest"));

    mazeChannels.forEach(async channel => { // Deletes inactive maze channels
      let message = await channel.messages.fetch({
        limit: 1
      });

      message = message.first();

      if (message && (Date.now() - message.createdTimestamp) > 300000) {
        const permissions = channel.permissionsFor(channel.guild.me);
        if (permissions.has("MANAGE_CHANNELS")) {
          channel.delete()
            .catch(e => bot.log(`Error deleting maze channel: ${e.stack}`, "error"));
        }
      }
    });

    const activeEffectsUsers = users.filter(u => u.stats.activeEffects.length > 0);
    activeEffectsUsers.forEach(user => { // Removes any expired effects
      const expirationTimes = {
        "floo powder": 3600000,
        "fire protection": 3600000,
        "luck": 3600000,
        "strength": 5400000,
        "exstimulo": 5400000
      };

      const activeEffects = user.stats.activeEffects.filter(e => (Date.now() - e.time) >= expirationTimes[e.type]);
      activeEffects.forEach(effect => {
        if (effect.type == "floo powder") {
          const guild = bot.guilds.cache.get(user.guild);
          if (guild) {
            const role = guild.roles.cache.find(r => r.name.toLowerCase() == "apparition");
            if (role) {
              const u = guild.members.cache.get(user.user);
              u.roles.remove(role)
                .catch(e => bot.log(`Error removing apparition role: ${e.stack}`, "error"));

              bot.log("Removed a user's floo powder role.", "info");
            }
          }
        } else if (effect.type == "luck") {
          db.userInfo.set(`${user.guild}-${user.user}`, 0, "stats.luck");
          bot.log("Removed a user's luck.", "info");
        } else if (effect.type == "strength") {
          db.userInfo.math(`${user.guild}-${user.user}`, "-", 2, "stats.defense");
          bot.log("Removed a users strength effect.", "info");
        } else if (effect.type == "exstimulo") {
          db.userInfo.math(`${user.guild}-${user.user}`, "-", 2, "stats.attack");
          bot.log("Removed a user's exstimulo potion effect.", "info");
        } else if (effect.type == "fire protection") {
          bot.log("Removed a user's fire protection effect.", "info");
        }

        db.userInfo.remove(`${user.guild}-${user.user}`, (e) => e.time == effect.time, "stats.activeEffects");
      });
    });

    users.filter(u => u.stats.poisonedObject).forEach(user => { // Checks for users who have been poisoned and whether or not they've fainted
      const poisonedObject = user.stats.poisonedObject;

      const timeObject = { // Time in milliseconds until they faint
        "common": 7200000,
        "uncommon": 3600000
      };

      if ((Date.now() - poisonedObject.time) >= timeObject[poisonedObject.type]) {
        const guild = bot.guilds.cache.get(user.guild);
        if (guild) {
          const member = guild.members.cache.get(user.user);
          if (member) {
            db.userInfo.dec(`${user.guild}-${user.user}`, "stats.maxHealth");
            db.userInfo.set(`${user.guild}-${user.user}`, null, "stats.poisonedObject");
            bot.functions.fainted(member, `${member} has succumbed to the poison and is now unconscious! Can you help me revive them?`);
          }
        }
      }
    });
  }, 30000);
};