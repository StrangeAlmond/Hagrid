const Discord = require("discord.js");
const moment = require("moment-timezone");
const TrainingSession = require("../classes/TrainingSession.js");
const triviaQuestions = require("../jsonFiles/triviaQuestions.json");
const years = require("../jsonFiles/years.json");
const spells = require("../jsonFiles/spells.json");
const xpCooldown = new Set();
const xpAmount = 4;
const users = {};
/*
	TODO:
	- Easter eggs
*/
module.exports = async (bot, message) => {
  if (message.author.bot || message.channel.type == "dm") return;

  // Removes any weird characters that will mess up commands
  message.content = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/’/g, "'");

  // Args for a non-command
  const plainArgs = message.content.toLowerCase().split(/ +/);

  // Ensure the guild this message was sent in has an entry in the database
  const guildData = bot.guildInfo.ensure(message.guild.id, {
    guild: message.guild.id,
    scheduledTrainingSessions: [],
    spawns: [],
    events: [],
    housePoints: {
      slytherin: 0,
      gryffindor: 0,
      hufflepuff: 0,
      ravenclaw: 0
    },
  });

  const key = `${message.guild.id}-${message.author.id}`;

  const userData = bot.functions.ensureUser(message.member, bot);
  bot.userInfo.set(key, Date.now(), "lastMsg");

  if (!message.member.hasPermission("MANAGE_GUILD") && message.channel.name != "training-grounds") {
    if (!users[key]) users[key] = [];

    users[key] = users[key].filter(i => i > (Date.now() - 2000));
    users[key].push(Date.now());

    if (users[key].length > 4) {
      const silencedRole = message.guild.roles.find(r => r.name.toLowerCase() == "silenced");

      if (silencedRole) {
        message.member.addRole(silencedRole);
        setTimeout(() => {
          message.member.removeRole(silencedRole);
        }, 5000);
      }
    }
  }

  if (bot.blacklistedWords.some(w => plainArgs.includes(w))) {
    message.delete();

    bot.functions.quickWebhook(message.channel, `Muggle profanity is forbidden in the wizard world, ${message.member.displayName}. I don't have to expel you, do I?`, {
      username: "Dolores Umbridge",
      avatar: "../images/webhook_avatars/doloresUmbridge.png",
      deleteAfterUse: true
    }).then(msg => msg.delete({ timeout: 5000 }));

    bot.userInfo.inc(key, "stats.profanityWarns");

    const logChannel = message.guild.channels.cache.find(c => c.name == "incidents");
    if (logChannel) {
      const logEmbed = new Discord.MessageEmbed()
        .setAuthor("Profanity Filter")
        .addField("User", message.member.displayName, true)
        .addField("Channel", `${message.channel}`, true)
        .addField("Detected Word", bot.blacklistedWords.find(w => plainArgs.includes(w)), true)
        .addField("Message Content", message.content)
        .setColor("#DD889F")
        .setFooter(`${message.member.displayName} has used profanity ${bot.userInfo.get(key, "stats.profanityWarns")} time(s).`)
        .setTimestamp();

      bot.functions.quickWebhook(logChannel, logEmbed, {
        username: "Dolores Umbridge",
        avatar: "../images/webhook_avatars/doloresUmbridge.png",
        deleteAfterUse: true
      });
    }
  }

  if (userData.stats.activeEffects.some(e => e.type == "maximum turbo farts")) {
    const object = userData.stats.activeEffects.find(e => e.type == "maximum turbo farts");
    object.reactionsLeft--;

    const activeEffects = userData.stats.activeEffects;

    activeEffects.splice(activeEffects.findIndex(e => e.type == object.type), 1, object);
    bot.userInfo.set(key, activeEffects, "stats.activeEffects");

    if (object.reactionsLeft <= 0) {
      activeEffects.splice(activeEffects.findIndex(e => e.type == object.type), 1);
      bot.userInfo.set(key, activeEffects, "stats.activeEffects");
    }

    const turboFartsEmoji = bot.emojis.find(e => e.name.toLowerCase() == "turbofarts");
    if (turboFartsEmoji) message.react(turboFartsEmoji);
  }

  if (bot.frogSoapChannels.some(f => f.channel == message.channel.id)) {
    message.react("🐸");
  }

  if (triviaQuestions.some(q => q.answers.some(a => a == message.content.toLowerCase())) &&
    guildData.spawns.some(s => s.type == "trivia" && s.channel == message.channel.id)) {

    const webhookObjects = {
      slytherin: {
        username: "Bloody Baron",
        avatar: "./images/webhook_avatars/bloodyBaron.jpg"
      },
      gryffindor: {
        username: "Nearly Headless Nick",
        avatar: "./images/webhook_avatars/nearlyHeadlessNick.jpg"
      },
      hufflepuff: {
        username: "Fat Friar",
        avatar: "./images/webhook_avatars/fatFriar.png"
      },
      ravenclaw: {
        username: "The Grey Lady",
        avatar: "./images/webhook_avatars/theGreyLady.jpg"
      }
    };

    const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
    const house = houses.find(h => message.member.roles.some(r => r.name.toLowerCase() == h));

    if (house) {
      const triviaQuestion = guildData.spawns.find(s => s.channel == message.channel.id && s.type == "trivia");

      bot.userInfo.inc(key, "stats.housePoints");
      bot.guildInfo.inc(message.guild.id, `housePoints.${house}`);
      bot.guildInfo.removeFrom(message.guild.id, "spawns", triviaQuestion);

      bot.functions.quickWebhook(message.channel, `Congratulations ${message.member}! You guessed the answer correctly! you and your house have gained 1 point.`, webhookObjects[house]);
    }
  }

  const chance = Math.random() * 100;
  if (chance <= 1) {
    let spawns = ["dementor", "boggart", "chest", "trivia"];

    const validChannels = [
      "515765584970121217",
      "377943683472818207",
      "512781096946106378",
      "512781360943988736"
    ];

    if (!validChannels.includes(message.channel.id)) spawns = [];

    const spawn = spawns[Math.floor(Math.random() * spawns.length)];
    const object = {
      channel: message.channel.id,
      time: Date.now()
    };

    if (spawn == "dementor") {
      object.type = "dementor";
      const attachment = new Discord.Attachment("../images/spawns/dementor.jpg", "dementor.jpg");
      message.channel.send(`A dementor has spawned! Years 5 and up can banish it by using \`${bot.prefix}expecto patronum\`!`, attachment);
    } else if (spawn == "boggart") {
      object.type = "boggart";
      const attachment = new Discord.Attachment("../images/spawns/boggart.jpg", "boggart.jpg");
      message.channel.send(`A boggart has spawned! Years 3 and up can banish it by using \`${bot.prefix}riddikulus\`!`, attachment);
    } else if (spawn == "chest") {
      object.type = "chest";
      const attachment = new Discord.Attachment("../images/spawns/chest.png", "chest.png");
      message.channel.send(`A chest has appeared! open it with \`${bot.prefix}cistem aperio\`!`, attachment);
    } else if (spawn == "trivia") {
      object.type = "trivia";

      const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
      const house = houses.find(h => message.member.roles.some(r => r.name.toLowerCase() == h));

      if (house) {
        const channel = message.guild.channels.find(c => c.name.includes(house));

        if (channel && !guildData.spawns.some(s => s.channel == channel.id)) {
          object.channel = channel.id;

          const triviaObject = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
          const question = triviaObject.question;

          const webhookObjects = {
            slytherin: {
              username: "Bloody Baron",
              avatar: "./images/webhook_avatars/bloodyBaron.jpg"
            },
            gryffindor: {
              username: "Nearly Headless Nick",
              avatar: "./images/webhook_avatars/nearlyHeadlessNick.jpg"
            },
            hufflepuff: {
              username: "Fat Friar",
              avatar: "./images/webhook_avatars/fatFriar.png"
            },
            ravenclaw: {
              username: "The Grey Lady",
              avatar: "./images/webhook_avatars/theGreyLady.jpg"
            }
          };

          object.webhookObject = webhookObjects[house];
          bot.functions.quickWebhook(channel, `It's trivia time ${house} members! try to guess the answer to the question below:\n\n${question}`, webhookObjects[house]);
        }
      }
    }

    if (!(guildData.spawns.some(s => s.channel == object.channel) && object.type == "trivia")) {
      if (guildData.spawns.some(s => s.channel == object.channel)) {
        bot.guildInfo.removeFrom(message.guild.id, guildData.spawns.find(s => s.channel == object.channel), "spawns");
      }

      bot.guildInfo.push(message.guild.id, object, "spawns");
    }
  }

  // If the message isn't a command then give them xp
  if (!bot.commands.find(cmd => cmd.name == plainArgs[0].slice(1)) && !bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(plainArgs[0].slice(1))) &&
    !spells.some(s => s.spell == message.content.toLowerCase()) && ![`${bot.prefix}u`, `${bot.prefix}d`, `${bot.prefix}l`, `${bot.prefix}d`].includes(plainArgs[0])) {

    if (!xpCooldown.has(key)) {
      bot.userInfo.math(key, "+", xpAmount, "xp");
      xpCooldown.add(key);

      setTimeout(() => {
        xpCooldown.delete(key);
      }, 15000);
    }
  }

  if (userData.year < 7 && userData.xp > years[userData.year + 1].xp) bot.functions.levelUp(message.member, message.channel);
  if (!message.content.startsWith(bot.prefix)) return;

  let args = message.content.slice(bot.prefix.length).toLowerCase().split(/ +/);

  const mazeCommandAliases = {
    "u": "up",
    "d": "down",
    "l": "left",
    "r": "right"
  };

  // Allows a user to use the maze aliases without getting rid of other command aliases
  if (mazeCommandAliases[args[0]] && message.channel.name.endsWith("-forbidden-forest")) {
    args = ["move", mazeCommandAliases[args[0]]];
  }

  if (guildData.spawns.some(s => s.type == "trainingSession" && s.channel == message.channel.id && args.join(" ") == s.beast.spell.slice(1))) {
    const object = guildData.spawns.find(s =>
      s.type == "trainingSession" &&
      s.channel == message.channel.id &&
      args.join(" ") == s.beast.spell.slice(1)
    );

    const trainingSession = new TrainingSession(bot, message.channel);
    return await trainingSession.processTrainingSession(message.member, object);
  }

  // Ensure their knuts and sickles aren't above 29 and 17 respectively
  if (userData.balance.knuts >= 29) {
    let knuts = bot.userInfo.get(key, "balance.knuts");
    for (let i = 0; knuts >= 29; i++) {
      bot.userInfo.math(key, "+", 1, "balance.sickles");
      bot.userInfo.math(key, "-", 29, "balance.knuts");
      knuts -= 29;
    }
  }

  if (userData.balance.sickles >= 17) {
    let sickles = bot.userInfo.get(key, "balance.sickles");
    for (let i = 0; sickles >= 17; i++) {
      bot.userInfo.math(key, "+", 1, "balance.galleons");
      bot.userInfo.math(key, "-", 17, "balance.sickles");
      sickles -= 17;
    }
  }

  // Get the command's object
  const commandName = args.shift().toLowerCase();
  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) return;

  command.args = args;
  message.author.key = `${message.guild.id}-${message.author.id}`;
  bot.userInfo.set(key, command, "stats.lastSpell");

  command.execute(message, args, bot).catch(e => {
    bot.log(e.stack, "error");
    return message.channel.send("🚫  There was an error trying to execute that command, please contact StrangeAlmond#0001.");
  });

  const commandLog = `${message.member.displayName} (${message.author.id}) used the ${bot.prefix}${command.name} ${args.join(" ")} command, in channel #${message.channel.name} (${message.channel.id}) at ${moment(message.createdTimestamp).tz("America/Los_Angeles").format("llll")}, in the guild ${message.guild.name} (${message.guild.id}).`;
  bot.log(commandLog, "info");
};