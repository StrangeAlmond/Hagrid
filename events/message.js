const Discord = require("discord.js");

const triviaQuestions = require("../jsonFiles/triviaQuestions.json");
const years = require("../jsonFiles/years.json");

const chalk = require("chalk");

const moment = require("moment-timezone");

const xpCooldown = new Set();
const xpAmount = 4;

const users = {};

/*
	TODO:
	- Easter eggs
	- Raids
*/

module.exports = async (bot, message) => {
	// Ensure the author isn't a bot and the message isn't a DM
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;

	// Normalized message content
	message.content = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/’/g, "'");

	// Args for a non-command
	const plainArgs = message.content.toLowerCase().split(/ +/);

	// Ensure the guild has data
	bot.guildInfo.ensure(message.guild.id, {
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

	const guildData = bot.guildInfo.get(message.guild.id);

	// Ensure the user has data
	bot.ensureUser(message.member);

	bot.userInfo.set(`${message.guild.id}-${message.author.id}`, Date.now(), "lastMsg");

	// Get the user's data
	const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

	if (!message.member.hasPermission("MANAGE_SERVER") && message.channel.name !== "training-grounds") {
		const key = `${message.guild.id}-${message.author.id}`;

		if (!users[key]) users[key] = [];

		users[key] = users[key].filter(i => i > (Date.now() - 2000));

		users[key].push(Date.now());

		if (users[key].length < 4) return;

		const silencedRole = message.guild.roles.find(r => r.name.toLowerCase() === "silenced");
		if (!silencedRole) return;

		message.member.addRole(silencedRole);

		setTimeout(() => {
			message.member.removeRole(silencedRole);
		}, 5000);
	}

	if (bot.blacklistedWords.some(w => plainArgs.includes(w))) {
		message.delete();

		bot.quickWebhook(message.channel, "Please don't use muggle profanity in the wizard world!", {
			username: "Dolores Umbridge",
			avatar: "./images/webhook avatars/doloresUmbridge.png",
			deleteAfterUse: true
		}).then(msg => msg.delete(5000));

		const logChannel = message.guild.channels.find(c => c.name === "incidents");
		if (!logChannel) return;

		const logEmbed = new Discord.RichEmbed()
			.setAuthor("Profanity Filter")
			.addField("User", message.member.displayName, true)
			.addField("Channel", `${message.channel}`, true)
			.addField("Detected Word", bot.blacklistedWords.find(w => plainArgs.includes(w)), true)
			.addField("Message Content", message.content)
			.setColor("#DD889F")
			.setFooter(`${message.member.displayName} has used profanity ${bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "profanityWarns")} time(s).`)
			.setTimestamp();

		bot.quickWebhook(logChannel, logEmbed, {
			username: "Dolores Umbridge",
			avatar: "./images/webhook avatars/doloresUmbridge.png",
			deleteAfterUse: true
		});
	}

	if (userData.stats.activeEffects.some(e => e.type === "maximum turbo farts")) {
		const object = userData.stats.activeEffects.find(e => e.type === "maximum turbo farts");

		object.reactionsLeft--;

		userData.stats.activeEffects.splice(userData.stats.activeEffects.findIndex(e => e.type === object.type), 1, object);
		bot.userInfo.set(`${message.guild.id}-${message.author.id}`, userData.stats.activeEffects, "stats.activeEffects");

		if (object.reactionsLeft <= 0) {
			userData.stats.activeEffects.splice(userData.stats.activeEffects.findIndex(e => e.type === object.type), 1);
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, userData.stats.activeEffects, "stats.activeEffects");
		}

		const turboFartsEmoji = bot.emojis.find(e => e.name.toLowerCase() === "turbofarts");
		if (turboFartsEmoji) message.react(turboFartsEmoji);
	}

	if (bot.frogSoapChannels.some(f => f.channel === message.channel.id)) {
		message.react("🐸");
	}

	if (triviaQuestions.some(q => q.answers.some(a => plainArgs.includes(a))) && guildData.spawns.some(s => s.type === "trivia" && s.channel === message.channel.id)) {
		const webhookObjects = {
			slytherin: {
				username: "Bloody Baron",
				avatar: "./images/webhook avatars/bloodyBaron.jpg"
			},

			gryffindor: {
				username: "Nearly Headless Nick",
				avatar: "./images/webhook avatars/nearlyHeadlessNick.jpg"
			},

			hufflepuff: {
				username: "Fat Friar",
				avatar: "./images/webhook avatars/fatFriar.png"
			},

			ravenclaw: {
				username: "The Grey Lady",
				avatar: "./images/webhook avatars/theGreyLady.jpg"
			}
		};

		const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
		const house = houses.find(h => message.member.roles.some(r => r.name.toLowerCase() === h));
		if (!house) return;

		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.housePoints");
		bot.guildInfo.inc(message.guild.id, `housePoints.${house}`);
		bot.guildInfo.removeFrom(message.guild.id, "spawns", guildData.spawns.find(s => s.channel === message.channel.id));

		bot.quickWebhook(message.channel, `Congratulations ${message.member}! You guessed the answer correctly! you and your house have gained 1 point.`, webhookObjects[house]);
	}

	const chance = Math.random() * 100;

	if (chance <= 1) {

		const spawns = ["dementor", "boggart", "chest", "trivia"];
		const spawn = spawns[Math.floor(Math.random() * spawns.length)];

		const object = {
			channel: message.channel.id,
			time: Date.now()
		};

		if (spawn === "dementor") {
			object.type = "dementor";

			const attachment = new Discord.Attachment("./images/dementor.jpg", "dementor.jpg");
			message.channel.send(`A dementor has spawned! Years 5 and up can banish it by using \`${bot.prefix}expecto patronum\`!`, attachment);
		} else if (spawn === "boggart") {
			object.type = "boggart";

			const attachment = new Discord.Attachment("./images/boggart.jpg", "boggart.jpg");
			message.channel.send(`A boggart has spawned! Years 3 and up can banish it by using \`${bot.prefix}riddikulus\`!`, attachment);
		} else if (spawn === "chest") {
			object.type = "chest";

			const attachment = new Discord.Attachment("./images/chest.png", "chest.png");
			message.channel.send(`A chest has appeared! open it with \`${bot.prefix}cistem aperio\`!`, attachment);
		} else if (spawn === "trivia") {
			object.type = "trivia";

			const houses = ["slytherin", "gryffindor", "hufflepuff", "ravenclaw"];
			const house = houses.find(h => message.member.roles.some(r => r.name.toLowerCase() === h));
			if (!house) return;

			const channel = message.guild.channels.find(c => c.name.includes(house));
			if (!channel) return;

			if (!guildData.spawns.some(s => s.channel === channel.id)) {

				object.channel = channel.id;

				const triviaObject = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];

				const question = triviaObject.question;

				const webhookObjects = {
					slytherin: {
						username: "Bloody Baron",
						avatar: "./images/webhook avatars/bloodyBaron.jpg"
					},

					gryffindor: {
						username: "Nearly Headless Nick",
						avatar: "./images/webhook avatars/nearlyHeadlessNick.jpg"
					},

					hufflepuff: {
						username: "Fat Friar",
						avatar: "./images/webhook avatars/fatFriar.png"
					},

					ravenclaw: {
						username: "The Grey Lady",
						avatar: "./images/webhook avatars/theGreyLady.jpg"
					}
				};

				object.webhookObject = webhookObjects[house];

				bot.quickWebhook(channel, `It's trivia time ${house} members! try to guess the answer to the question below:\n\n${question}`, webhookObjects[house]);
			}
		}

		if (!(guildData.spawns.some(s => s.channel === object.channel) && object.type === "trivia")) {
			if (guildData.spawns.some(s => s.channel === object.channel)) bot.guildInfo.removeFrom(message.guild.id, guildData.spawns.find(s => s.channel === object.channel), "spawns");

			bot.guildInfo.push(message.guild.id, object, "spawns");
		}
	}

	// If the message isn't a command then give them xp
	if (!bot.commands.find(cmd => cmd.name === plainArgs[0].slice(1)) && !bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(plainArgs[0].slice(1)))) {

		// If their xp cooldown has expired give them xp
		if (!xpCooldown.has(`${message.guild.id}-${message.author.id}`)) {

			// Give them xpAmount xp
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", xpAmount, "xp");

			// Add the cooldown to them
			xpCooldown.add(`${message.guild.id}-${message.author.id}`);

			// Remove the cooldown after 15 seconds
			setTimeout(() => {
				xpCooldown.delete(`${message.guild.id}-${message.author.id}`);
			}, 15000);
		}

	}

	if (userData.year < 7 && userData.xp > years[userData.year + 1].xp) {
		const lootbox = years[userData.year + 1].lootbox;

		for (let [key, value] of Object.entries(lootbox)) {
			if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, `inventory.${key}`)) bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, `inventory.${key}`);
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", value, `inventory.${key}`);
		}

		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "year");

		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 2, "stats.health");
		bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 2, "stats.maxHealth");

		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.defense");
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.attack");

		const lootboxContent = Object.entries(lootbox).map(i => `**${i[0].replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:** ${i[1]}`).join("\n");

		message.channel.send(`Congratulations ${message.member}! You've just leveled up to year ${userData.year + 1} and have a achieved a tier ${userData.year + 1} lootbox with the below content:\n${lootboxContent}`);
	}

	if (!message.content.startsWith(bot.prefix)) return;

	let args = message.content.slice(bot.prefix.length).toLowerCase().split(/ +/);

	if (args[0] === "u" && message.channel.name.endsWith("-forbidden-forest")) {
		args = ["move", "up"];
	}

	if (args[0] === "d" && message.channel.name.endsWith("-forbidden-forest")) {
		args = ["move", "down"];
	}

	if (args[0] === "l" && message.channel.name.endsWith("-forbidden-forest")) {
		args = ["move", "left"];
	}

	if (args[0] === "r" && message.channel.name.endsWith("-forbidden-forest")) {
		args = ["move", "right"];
	}

	if (guildData.spawns.some(s => s.type === "training session" && s.channel === message.channel.id && args.join(" ") === s.beast.spell.slice(1))) {
		const object = guildData.spawns.find(s => s.type === "training session" && s.channel === message.channel.id && args.join(" ") === s.beast.spell.slice(1));
		return bot.processTrainingSession(message.member, object, message.channel, bot);
	}

	// Ensure their knuts and sickles aren't above 29 and 17 respectively
	if (userData.balance.knuts >= 29) {
		for (let i = 0; bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.knuts") >= 29; i++) {
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 1, "balance.sickles");
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 29, "balance.knuts");
		}
	}

	if (userData.balance.sickles >= 17) {
		for (let i = 0; bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "balance.sickles") >= 17; i++) {
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "+", 1, "balance.galleons");
			bot.userInfo.math(`${message.guild.id}-${message.author.id}`, "-", 17, "balance.sickles");
		}
	}

	// Get the command's object
	const commandName = args.shift().toLowerCase();
	const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;

	command.args = args;

	// Set that command as their last command
	bot.userInfo.set(`${message.guild.id}-${message.author.id}`, command, "stats.lastSpell");

	// Execute the command
	command.execute(message, args, bot).catch(e => {
		bot.logger.log("error", chalk.red(e.stack));
		return message.channel.send("🚫  There was an error trying to execute that command, please contact StrangeAlmond#0001.");
	});

	// Log that they used that command
	const commandLog = `${message.member.displayName} (${message.author.id}), used the !${command.name} ${args.join(" ")} command, in channel #${message.channel.name} (${message.channel.id}) at ${moment(message.createdTimestamp).tz("America/Los_Angeles").format("llll")}, in the guild ${message.guild.name} (${message.guild.id}).`;
	bot.logger.log("info", chalk.cyan(commandLog));
};
