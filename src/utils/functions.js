const Discord = require("discord.js");
const moment = require("moment-timezone");
const quickWebhook = require("./quickWebhook.js");
const years = require("../jsonFiles/years.json");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");

module.exports = {
  ensureUser(user, bot) { // Ensures the user has an entry in the database.
    const woodTypes = ["Acacia", "Alder", "Apple", "Ash", "Aspen", "Beech", "Blackthorn", "Black Walnut", "Cedar", "Cherry", "Chestnut", "Cypress", "Dogwood", "Ebony", "Elder", "Elm", "English Oak", "Fir", "Hawthorn", "Hazel", "Holly", "Hornbeam", "Latch", "Laurel", "Maple", "Pear", "Pine", "Poplar", "Red Oak", "Redwood", "Rowan", "Silver Lime", "Spruce", "Sycamore", "Vine", "Walnut", "Willow", "Yew"];
    const cores = ["Unicorn Hair", "Dragon Heartstring", "Phoenix Feather"];
    const lengths = ["9", "9 1/4", "9 1/2", "9 3/4", "10", "10 1/4", "10 1/2", "10 3/4", "11", "11 1/4", "11 1/2", "11 3/4", "12", "12 1/4", "12 1/2", "12 3/4", "13", "13 1/4", "13 1/2", "13 3/4", "14"];
    const flexibilities = ["Surprisingly Swishy", "Pliant", "Supple", "Reasonably Supple", "Quite Flexible", "Quite Bendy", "Slightly Yielding", "Slightly Springy", "Unbending", "Unyielding", "Brittle", "Rigid", "Solid", "Hard"];

    return bot.userInfo.ensure(`${user.guild.id}-${user.id}`, {
      user: user.id,
      name: user.displayName,
      guild: user.guild.id,
      lastMsg: null,

      year: 1,
      xp: 0,

      quests: [],

      studiedSpells: [],

      cauldron: "pewter",

      badges: [],
      pets: [],

      flooPowderInfo: null,

      trainingTokenUse: null,

      reminders: [],

      balance: {
        knuts: 0,
        sickles: 0,
        galleons: 0,
      },

      wand: {
        wood: woodTypes[Math.floor(Math.random() * woodTypes.length)],
        core: cores[Math.floor(Math.random() * cores.length)],
        length: lengths[Math.floor(Math.random() * lengths.length)],
        flexibility: flexibilities[Math.floor(Math.random() * flexibilities.length)]
      },

      cooldowns: {
        lastDaily: null,
        lastButterbeer: null,
        lastResurrectionStoneUse: null,
        lastStudy: null,
        nextWeekly: null
      },

      lifetimeEarnings: {
        knuts: 0,
        sickles: 0,
        galleons: 0
      },

      collectorsItems: {},

      spellInfo: {},

      inventory: {},

      mazeInfo: {
        curPos: 42.12,
        lastPos: 42.12,
        tileType: "inactive",
        curMaze: "level1",
        dailyForagesLeft: 100,
        lastForage: moment.tz("America/Los_Angeles").format("l"),
        encounterPositions: [],
        ambushPositions: [],
        itemPositions: [],
        inFight: false
      },

      stats: {
        mutes: 0,
        profanityWarns: 0,
        duelsWon: 0,
        duelsLost: 0,
        prestiges: 0,
        trainingSessionDamage: 0,
        trainingSessionsDefeated: 0,
        trainingSessions: 0,
        boggartsDefeated: 0,
        dementorsDefeated: 0,
        chestsOpened: 0,
        pranks: 0,
        triviaAnswered: 0,
        beansEaten: 0,
        uniqueBeansEaten: [],
        potionsMade: 0,
        potionsUsed: 0,
        forages: 0,
        purchases: 0,
        butterbeer: 0,
        housePoints: 0,
        lifetimeXp: 0,
        lastSpell: "N/A",
        owls: null,

        attack: 1,
        defense: 1,
        health: 48,
        maxHealth: 48,
        luck: 0,
        fainted: false,
        poisonedObject: null,

        activeEffects: [],
      },

      settings: {
        trainingSessionAlerts: true,
      }
    });
  },

  levelUp(bot, member, channel) {
    const guild = member.guild;
    const userData = bot.userInfo.get(`${guild.id}-${member.id}`);

    const lootbox = years[userData.year + 1].lootbox;

    for (const [key, value] of Object.entries(lootbox)) {
      if (!bot.userInfo.hasProp(`${guild.id}-${member.id}`, `inventory.${key}`)) bot.userInfo.set(`${guild.id}-${member.id}`, 0, `inventory.${key}`);
      bot.userInfo.math(`${guild.id}-${member.id}`, "+", value, `inventory.${key}`);
    }

    const roleNames = {
      1: "First Year",
      2: "Second Year",
      3: "Third Year",
      4: "Fourth Year",
      5: "Fifth Year",
      6: "Sixth Year",
      7: "Seventh Year"
    };

    const role = guild.roles.cache.find(r => r.name.toLowerCase() == roleNames[userData.year].toLowerCase());
    const newRole = guild.roles.cache.find(r => r.name.toLowerCase() == roleNames[userData.year + 1].toLowerCase());
    member.roles.remove(role);
    member.roles.add(newRole);

    bot.userInfo.inc(`${guild.id}-${member.id}`, "year");

    bot.userInfo.math(`${guild.id}-${member.id}`, "+", 2, "stats.health");
    bot.userInfo.math(`${guild.id}-${member.id}`, "+", 2, "stats.maxHealth");

    bot.userInfo.inc(`${guild.id}-${member.id}`, "stats.defense");
    bot.userInfo.inc(`${guild.id}-${member.id}`, "stats.attack");

    const lootboxContent = Object.entries(lootbox).map(i => `**${i[0].replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:** ${i[1]}`).join("\n");

    channel.send(`Congratulations ${member}! You've just leveled up to year ${userData.year + 1} and have a achieved a tier ${userData.year + 1} lootbox with the below content:\n${lootboxContent}`);
  },

  timeUntilMidnight() {
    const midnight = new Date();
    midnight.setHours(31, 0, 0, 0);

    const now = Date.now();
    const msToMidnight = midnight - now;
    return msToMidnight;
  },

  async fainted(member, faintMessage, bot) {
    const hospitalChannel = member.guild.channels.cache.find(c => c.name.includes("hospital"));
    if (!hospitalChannel) return;

    const userData = bot.userInfo.get(`${member.guild.id}-${member.id}`);
    bot.userInfo.set(`${member.guild.id}-${member.id}`, true, "stats.fainted");

    const hospitalMessages = await hospitalChannel.messages.fetch();
    const poisonedMessage = hospitalMessages.find(m => m.content.includes(member.id) && m.content.toLowerCase().includes("poison") && !userData.stats.poisonedObject);

    if (poisonedMessage) poisonedMessage.delete();

    const msg = await quickWebhook(hospitalChannel, faintMessage, {
      username: "Madam Pomfrey",
      avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
    });

    msg.react("✅");

    setTimeout(() => {
      if (bot.userInfo.get(`${member.guild.id}-${member.id}`, "stats.fainted")) {
        bot.userInfo.set(`${member.guild.id}-${member.id}`, false, "stats.fainted");
        bot.userInfo.set(`${member.guild.id}-${member.id}`, 1, "stats.health");

        msg.delete();
      }
    }, this.timeUntilMidnight());

  },

  poisoned: async function (member, poisonMessage, poisonType, bot) {
    const hospitalChannel = member.guild.channels.cache.find(c => c.name.includes("hospital"));
    if (!hospitalChannel) return;

    const poisonedObject = {
      type: poisonType,
      time: Date.now()
    };

    bot.userInfo.set(`${member.guild.id}-${member.id}`, poisonedObject, "stats.poisonedObject");

    const potionEmoji = bot.emojis.cache.find(e => e.name.toLowerCase() == "potion");

    const msg = await quickWebhook(hospitalChannel, poisonMessage, {
      username: "Madam Pomfrey",
      avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
    });

    msg.react(potionEmoji);
  },

  awaitResponse(filter, time, channel, integerOnly) {
    return new Promise((resolve, reject) => {
      const messageCollector = new Discord.MessageCollector(channel, filter, {
        max: 1,
        time: time
      });

      let responseCollected = false;

      messageCollector.on("collect", collected => {
        if (isNaN(collected) && integerOnly) return channel.send("This requires a number.");

        responseCollected = true;
        resolve(collected);
        messageCollector.stop();
      });

      messageCollector.on("end", () => {
        if (!responseCollected) resolve(undefined);
      });
    });
  },

  useResurrectionStone(bot, member, channel) {
    channel.send(`Just as ${member} was about to be attacked, the spirit of their loved one appeared and protected them.`);

    bot.userInfo.set(`${member.guild.id}-${member.id}`, Date.now(), "cooldowns.lastResurrectionStoneUse");
    bot.log(`${member.displayName} used the resurrection stone.`, "info");
  },

  toCamelCase(string) {
    return string.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
  },

  fromCamelCase(string) {
    return string.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
  },

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  capitalizeEveryFirstLetter(string) {
    return string.replace(/\b./g, m => m.toUpperCase());
  },

  isMazeChannel(channelName, member) {
    if (!channelName.includes(member.displayName.toLowerCase().replace(/[^a-z0-9+ ]+/gi, "").split(/ +/).join("-"))) return false;
    return true;
  },

  getUserFromMention(mention, guild) {
    if (!mention) return;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return;

    const id = matches[1];
    const user = guild.members.cache.get(id);

    if (!user) return;
    return user;
  },

  spawnDementor(channel, bot) {
    const object = {
      channel: channel.id,
      type: "dementor"
    };

    const guild = channel.guild;
    const guildData = bot.guildInfo.get(guild.id);

    const attachment = new Discord.MessageAttachment("../images/spawns/dementor.jpg", "dementor.jpg");
    channel.send(`A dementor has spawned! Years 5 and up can banish it by using \`${bot.prefix}expecto patronum\`!`, attachment);

    if (guildData.spawns.some(s => s.channel == object.channel)) bot.guildInfo.remove(guild.id, (s) => s.channel == object.channel, "spawns");
    bot.guildInfo.push(guild.id, object, "spawns");
  },

  spawnBoggart(channel, bot) {
    const object = {
      channel: channel.id,
      type: "boggart"
    };

    const guild = channel.guild;
    const guildData = bot.guildInfo.get(guild.id);

    const attachment = new Discord.MessageAttachment("../images/spawns/boggart.jpg", "boggart.jpg");
    channel.send(`A boggart has spawned! Years 3 and up can banish it by using \`${bot.prefix}riddikulus\`!`, attachment);

    if (guildData.spawns.some(s => s.channel == object.channel)) bot.guildInfo.remove(guild.id, (s) => s.channel == object.channel, "spawns");
    bot.guildInfo.push(guild.id, object, "spawns");
  },

  spawnChest(channel, bot) {
    const object = {
      channel: channel.id,
      type: "chest"
    };

    const guild = channel.guild;
    const guildData = bot.guildInfo.get(guild.id);

    const attachment = new Discord.MessageAttachment("../images/spawns/chest.png", "chest.png");
    channel.send(`A chest has appeared! open it with \`${bot.prefix}cistem aperio\`!`, attachment);

    if (guildData.spawns.some(s => s.channel == object.channel)) {
      bot.guildInfo.remove(guild.id, (s) => s.channel == object.channel, "spawns");
    }

    bot.guildInfo.push(guild.id, object, "spawns");
  },

  parseMs(ms, intOnly) { // Formats the given time and returns an object of different measures of time
    const seconds = (ms / 1000) % 60;
    const minutes = (ms / 60000) % 60;
    const hours = (ms / 3600000) % 24;
    const days = ms / 86400000;

    let object = {};

    if (intOnly) {
      object = {
        ms,
        seconds: parseInt(seconds),
        minutes: parseInt(minutes),
        hours: parseInt(hours),
        days: parseInt(days)
      };
    } else {
      object = {
        ms,
        seconds,
        hours,
        days
      };
    }

    return object;
  },

  async playOST(bot, channel) {
    const connection = await channel.join().catch(e => console.error(e.stack));

    if (!bot.ost) bot.ost = {};

    const playlist = await ytpl("https://www.youtube.com/playlist?list=PLVdr7xrwRyjY4DGuP-NUFEKYupdow4qGq", {
      limit: Infinity
    });

    const queue = bot.ost.queue || playlist.items.map(i => i.url_simple); // Creates a list of youtube videos that play the hp ost.
    let index = bot.ost.index || 1;

    if (!bot.ost.index) bot.ost = { index, queue };

    bot.dispatcher = connection.play(ytdl(queue[index - 1],
      {
        quality: "highestaudio"
      }), {
      highWaterMark: 50
    });

    bot.dispatcher.on("finish", () => {
      index++;
      if (!queue[index - 1]) index = 1;

      bot.ost.index = index;
      this.playOST(bot, channel);
    });

    bot.dispatcher.on("error", console.error);

    return bot.dispatcher;
  }
};