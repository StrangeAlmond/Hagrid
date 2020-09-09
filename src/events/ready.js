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
  bot.blacklistedWords = ["shite", "pron", "pr0n", "p0rn", "porn", "fuck", "f*ck", "b0ning", "f**ck", "boning", "b0ning", "t0sser", "tosser", "shit", "bitches", "sh*t", "s*it", "dumbass", "motherfucker", "nigger", "nigga", "bitch", "b*tch", "bi*ch", "mtherfcker", "motherfcker", "mtherfucker", "cunt", "c*nt", "cu*t", "piss", "dick", "pussy", "douche", "cock", "asshole", "faggot", "fag", "bastard", "slut", "douche", "whore", "ass", "bullshit", "bullsh1t", "bullsh*t", "asshole", "anus", "arse", "arsehole", "ass-jabber", "ass-pirate", "assbag", "assbandit", "assbanger", "assbite", "assclown", "asscock", "asscracker", "assface", "assfuck", "assfucker", "assgoblin", "asshat", "asshead", "asshole", "asshopper", "assjacker", "asslick", "asslicker", "asswad", "asswipe", "f0ck", "fck", "n1gga", "ballsack", "biatch", "ass", "bollok", "boob", "bugger", "buttplug", "clitoris", "vagina", "pussy", "coon", "cunt", "dildo", "dyke", "fag", "faggot", "homo", "jizz", "cum", "prick", "queer", "smegma", "hard-on", "pubes", "rimjob", "queef", "poontang", "tits", "hardon", "fuck-off", "boong", "porn", "kys", "gook", "faggot", "boong", "bollocks", "motherfucker", "dickhead", "dumbass", "fuckface", "shithead", "bumblefuck", "dipshit", "pornhub", "pornhub.com", "arse", "arsehole", "arseholes", "ass", "asshole", "assholes", "ballsack", "bellend", "bitch", "blowjob", "bollocks", "boob", "boobs", "boner", "bullshit", "buttfuck", "buttfucker", "buttplug", "clitoris", "cock", "cock", "sucker", "cocks", "cocksucker", "coon", "cum", "cunt", "cunts", "dick", "dickhead", "dicks", "dildo", "douche", "dyke", "fag", "faggot", "fellatio", "felching", "fuck", "fuckk", "fuckkk", "fucker", "fuckers", "fucking", "fudgepacker", "goatse", "heil", "hitler", "homo", "jizz", "kike", "labia", "motherfucker", "motherfucking", "muff", "nigga", "nigger", "niggers", "penis", "porno", "pussy", "pube", "pubes", "puta", "queer", "raghead", "ragheads", "rape", "rimjob", "s1ut", "sandnigger", "sausagejockey", "schlong", "scrote", "scrotum", "shít", "sh!t", "sh1t", "sh1thead", "sh1theads", "shag", "shagging", "shhit", "shit", "shitass", "shitbag", "shitbagger", "shitbrains", "shitbreath", "shitcunt", "shitdick", "shiteater", "shitface", "shitfaced", "shitforbrains", "shitfuck", "shitfucker", "shithead", "shithole", "shiting", "shits", "shitstain", "shitted", "shitter", "shitters", "shittiest", "shitting", "shittings", "shitty", "shiz", "shiznit", "skeet", "skullfuck", "slanteye", "slut", "slutbag", "sluts", "slutt", "slutting", "slutty", "slutwear", "slutwhore", "smeg", "smegma", "sonofabitch", "sonofbitch", "tit", "tits", "tranny", "twat", "wank", "wanker", "vagina", "vaginas", "whore", "whores", "swaffelen", "koro", "donaldkacsazas", "scheisse", "ficken", "miststuck", "arsch", "hayari", "oshiri", "coude", "koos", "sharmuta", "zib", "eikel", "klootzak", "rukhond", "cul", "mutterficker", "boobie", "boobies", "b00b", "b00bs", "2g1c", "acrotomophilia", "anal", "anilingus", "anus", "apeshit", "arsehole", "ass", "asshole", "assmunch", "autoerotic", "babeland", "baby juice", "ball gravy", "ball licking", "ball sucking", "bangbros", "bareback", "bastard", "bastardo", "bastinado", "bbw", "bdsm", "beaner", "beaners", "beaver lips", "bestiality", "big breasts", "big tits", "bimbos", "birdlock", "bitch", "bitches", "blowjob", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "bukkake", "bulldyke", "bullshit", "bunghole", "busty", "buttcheeks", "butthole", "camgirl", "camslut", "camwhore", "carpetmuncher", "circlejerk", "clit", "clitoris", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "coon", "coons", "creampie", "cum", "cumming", "cunnilingus", "cunt", "darkie", "daterape", "deepthroat", "dendrophilia", "dick", "dildo", "dingleberry", "dingleberries", "dirty sanchez", "doggiestyle", "doggystyle", "dolcett", "domination", "dominatrix", "dommes", "dvda", "ecchi", "ejaculation", "erotic", "erotism", "eunuch", "faggot", "fecal", "felch", "fellatio", "feltch", "femdom", "figging", "fingerbang", "fingering", "fisting", "footjob", "frotting", "fuck", "fuckin", "fucking", "fucktards", "fudgepacker", "futanari", "genitals", "goatcx", "goatse", "gokkun", "goodpoop", "goregasm", "grope", "g-spot", "guro", "handjob", "hentai", "homoerotic", "honkey", "hooker", "how to murder", "humping", "incest", "intercourse", "jailbait", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "lolita", "lovemaking", "male squirting", "masturbate", "milf", "motherfucker", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nimphomania", "nipple", "nipples", "nude", "nudity", "nympho", "nymphomania", "octopussy", "omorashi", "orgasm", "orgy", "paedophile", "paki", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "pissing", "pisspig", "playboy", "ponyplay", "poof", "poon", "poontang", "punany", "poopchute", "porn", "porno", "pornography", "pthc", "pubes", "pussy", "queaf", "queef", "quim", "raghead", "rape", "raping", "rapist", "rectum", "rimjob", "rimming", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexo", "sexy", "shemale", "shibari", "shit", "shitblimp", "shitty", "shota", "shrimping", "slanteye", "slut", "s&m", "smut", "snatch", "sodomize", "sodomy", "spic", "splooge", "spooge", "spunk", "strapon", "strappado", "swinger", "threesome", "throating", "tit", "tits", "titties", "titty", "topless", "tosser", "towelhead", "tranny", "tribadism", "tubgirl", "tushy", "twat", "twink", "upskirt", "urophilia", "vagina", "vibrator", "vorarephilia", "voyeur", "vulva", "wank", "wetback", "white power", "yaoi", "yiffy", "zoophilia"];

  // Functions
  bot.functions = functions;
  bot.functions.quickWebhook = quickWebhook;

  bot.user.setActivity("Just Started, Sorry for the downtime!");
  bot.log(`${bot.user.username} is online!\nUser: ${bot.user.username}\nSnowflake: ${bot.user.id}\nGuilds: ${bot.guilds.cache.size}\nUsers: ${bot.users.cache.size}\nPrefix: ${bot.prefix}`, "info");

  functions.playOST(bot, bot.channels.cache.get(botconfig.ostChannel));

  setTimeout(async () => {
    bot.user.setActivity(`!help | Version ${botconfig.version}`);
  }, 300000);

  const usersInFight = bot.userInfo.array().filter(u => u.mazeInfo.inFight);
  usersInFight.forEach(user => { // Takes users out of their fights from before the bot restarted
    bot.userInfo.set(`${user.guild}-${user.user}`, false, "mazeInfo.inFight");
  });

  const faintedUsers = bot.userInfo.array().filter(u => u.stats.fainted);
  faintedUsers.forEach(user => { // Revives fainted users at midnight
    setTimeout(async () => {
      if (!bot.userInfo.get(`${user.guild}-${user.user}`, "stats.fainted")) return;

      bot.userInfo.set(`${user.guild}-${user.user}`, false, "stats.fainted");
      bot.userInfo.set(`${user.guild}-${user.user}`, 1, "stats.health");

      const hospitalChannel = await bot.guilds.cache.get(user.guild).channels.cache.find(c => c.name.includes("hospital"));
      const messages = await hospitalChannel.messages.fetch();

      const msg = messages.find(m => m.content.includes(user.user) && m.content.toLowerCase().includes("fainted"));
      if (msg) msg.delete();
    }, bot.functions.timeUntilMidnight());
  });

  setInterval(() => {
    const guilds = bot.guildInfo.array();
    const users = bot.userInfo.array();

    guilds.forEach(guild => {

      if (guild.scheduledTrainingSessions.some(s => Date.now() >= s.time)) { // Spawns scheduled training sessions
        const trainingSession = guild.scheduledTrainingSessions.find(ts => Date.now() >= ts.time);

        guild.scheduledTrainingSessions.splice(guild.scheduledTrainingSessions.findIndex(s =>
          s.id == trainingSession.id), 1);
        bot.guildInfo.set(guild.guild, guild.scheduledTrainingSessions, "scheduledTrainingSessions");

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

            bot.guildInfo.set(guild.guild, guild.spawns, "spawns");
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

        bot.userInfo.set(`${u.guild}-${u.user}`, u.reminders, "reminders");
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

          bot.userInfo.set(`${user.guild}-${user.user}`, null, "trainingTokenUse");
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
        "strength": 5400000
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
          bot.userInfo.set(`${user.guild}-${user.user}`, 0, "stats.luck");
          bot.log("Removed a user's luck.", "info");
        } else if (effect.type == "strength") {
          bot.userInfo.math(`${user.guild}-${user.user}`, "-", 2, "stats.defense");
          bot.log("Removed a users strength effect.", "info");
        } else if (effect.type == "fire protection") {
          bot.log("Removed a user's fire protection effect.", "info");
        }

        bot.userInfo.remove(`${user.guild}-${user.user}`, (e) => e.time == effect.time, "stats.activeEffects");
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
            bot.userInfo.dec(`${user.guild}-${user.user}`, "stats.maxHealth");
            bot.userInfo.set(`${user.guild}-${user.user}`, null, "stats.poisonedObject");
            bot.functions.fainted(member, `${member} has succumbed to the poison and is now unconscious! Can you help me revive them?`);
          }
        }
      }
    });
  }, 30000);
};