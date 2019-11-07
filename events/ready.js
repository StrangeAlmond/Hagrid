const functions = require("../utils/functions.js");
const quickWebhook = require("../utils/quickWebhook.js");

const botconfig = require("../botconfig.json");
const prefix = botconfig.prefix;

const chalk = require("chalk");

module.exports = async bot => {
	// Log that the bot is online
	bot.logger.log("info", chalk.green(`Bot is logged in!\nUser: ${bot.user.username}\nGuilds: ${bot.guilds.size}\nMembers: ${bot.users.size}\nChannels: ${bot.channels.size}\nPrefix: ${prefix}\nCommands Loaded: ${bot.commands.size}\nBot is logged in!`));

	// Variables
	bot.frogSoapChannels = [];
	bot.prefix = prefix;
	bot.timezone = "America/Los_Angeles";
	bot.blacklistedWords = ["shite", "pron", "pr0n", "p0rn", "porn", "fuck", "f*ck", "b0ning", "f**ck", "boning", "b0ning", "t0sser", "tosser", "shit", "bitches", "sh*t", "s*it", "dumbass", "motherfucker", "nigger", "nigga", "bitch", "b*tch", "bi*ch", "mtherfcker", "motherfcker", "mtherfucker", "cunt", "c*nt", "cu*t", "piss", "dick", "pussy", "douche", "cock", "asshole", "faggot", "fag", "bastard", "slut", "douche", "whore", "ass", "bullshit", "bullsh1t", "bullsh*t", "asshole", "anus", "arse", "arsehole", "ass-jabber", "ass-pirate", "assbag", "assbandit", "assbanger", "assbite", "assclown", "asscock", "asscracker", "assface", "assfuck", "assfucker", "assgoblin", "asshat", "asshead", "asshole", "asshopper", "assjacker", "asslick", "asslicker", "asswad", "asswipe", "f0ck", "fck", "n1gga", "ballsack", "biatch", "ass", "bollok", "boob", "bugger", "buttplug", "clitoris", "vagina", "pussy", "coon", "cunt", "dildo", "dyke", "fag", "faggot", "homo", "jizz", "cum", "prick", "queer", "smegma", "hard-on", "pubes", "rimjob", "queef", "poontang", "tits", "hardon", "fuck-off", "boong", "porn", "kys", "gook", "faggot", "boong", "bollocks", "motherfucker", "dickhead", "dumbass", "fuckface", "shithead", "bumblefuck", "dipshit", "pornhub", "pornhub.com", "arse", "arsehole", "arseholes", "ass", "asshole", "assholes", "ballsack", "bellend", "bitch", "blowjob", "bollocks", "boob", "boobs", "boner", "bullshit", "buttfuck", "buttfucker", "buttplug", "clitoris", "cock", "cock", "sucker", "cocks", "cocksucker", "coon", "cum", "cunt", "cunts", "dick", "dickhead", "dicks", "dildo", "douche", "dyke", "fag", "faggot", "fellatio", "felching", "fuck", "fuckk", "fuckkk", "fucker", "fuckers", "fucking", "fudgepacker", "goatse", "heil", "hitler", "homo", "jizz", "kike", "labia", "motherfucker", "motherfucking", "muff", "nigga", "nigger", "niggers", "penis", "porno", "pussy", "pube", "pubes", "puta", "queer", "raghead", "ragheads", "rape", "rimjob", "s1ut", "sandnigger", "sausagejockey", "schlong", "scrote", "scrotum", "shít", "sh!t", "sh1t", "sh1thead", "sh1theads", "shag", "shagging", "shhit", "shit", "shitass", "shitbag", "shitbagger", "shitbrains", "shitbreath", "shitcunt", "shitdick", "shiteater", "shitface", "shitfaced", "shitforbrains", "shitfuck", "shitfucker", "shithead", "shithole", "shiting", "shits", "shitstain", "shitted", "shitter", "shitters", "shittiest", "shitting", "shittings", "shitty", "shiz", "shiznit", "skeet", "skullfuck", "slanteye", "slut", "slutbag", "sluts", "slutt", "slutting", "slutty", "slutwear", "slutwhore", "smeg", "smegma", "sonofabitch", "sonofbitch", "tit", "tits", "tranny", "twat", "wank", "wanker", "vagina", "vaginas", "whore", "whores", "swaffelen", "koro", "donaldkacsazas", "scheisse", "ficken", "miststuck", "arsch", "hayari", "oshiri", "coude", "koos", "sharmuta", "zib", "eikel", "klootzak", "rukhond", "cul", "mutterficker", "boobie", "boobies", "b00b", "b00bs", "2g1c", "acrotomophilia", "anal", "anilingus", "anus", "apeshit", "arsehole", "ass", "asshole", "assmunch", "autoerotic", "babeland", "baby juice", "ball gravy", "ball licking", "ball sucking", "bangbros", "bareback", "bastard", "bastardo", "bastinado", "bbw", "bdsm", "beaner", "beaners", "beaver lips", "bestiality", "big breasts", "big tits", "bimbos", "birdlock", "bitch", "bitches", "blowjob", "blumpkin", "bollocks", "bondage", "boner", "boob", "boobs", "bukkake", "bulldyke", "bullshit", "bunghole", "busty", "buttcheeks", "butthole", "camgirl", "camslut", "camwhore", "carpetmuncher", "circlejerk", "clit", "clitoris", "clusterfuck", "cock", "cocks", "coprolagnia", "coprophilia", "cornhole", "coon", "coons", "creampie", "cum", "cumming", "cunnilingus", "cunt", "darkie", "daterape", "deepthroat", "dendrophilia", "dick", "dildo", "dingleberry", "dingleberries", "dirty sanchez", "doggiestyle", "doggystyle", "dolcett", "domination", "dominatrix", "dommes", "dvda", "ecchi", "ejaculation", "erotic", "erotism", "eunuch", "faggot", "fecal", "felch", "fellatio", "feltch", "femdom", "figging", "fingerbang", "fingering", "fisting", "footjob", "frotting", "fuck", "fuckin", "fucking", "fucktards", "fudgepacker", "futanari", "genitals", "goatcx", "goatse", "gokkun", "goodpoop", "goregasm", "grope", "g-spot", "guro", "handjob", "hentai", "homoerotic", "honkey", "hooker", "how to murder", "humping", "incest", "intercourse", "jailbait", "jigaboo", "jiggaboo", "jiggerboo", "jizz", "juggs", "kike", "kinbaku", "kinkster", "kinky", "knobbing", "lolita", "lovemaking", "male squirting", "masturbate", "milf", "motherfucker", "muffdiving", "nambla", "nawashi", "negro", "neonazi", "nigga", "nigger", "nimphomania", "nipple", "nipples", "nude", "nudity", "nympho", "nymphomania", "octopussy", "omorashi", "orgasm", "orgy", "paedophile", "paki", "panties", "panty", "pedobear", "pedophile", "pegging", "penis", "pissing", "pisspig", "playboy", "ponyplay", "poof", "poon", "poontang", "punany", "poopchute", "porn", "porno", "pornography", "pthc", "pubes", "pussy", "queaf", "queef", "quim", "raghead", "rape", "raping", "rapist", "rectum", "rimjob", "rimming", "sadism", "santorum", "scat", "schlong", "scissoring", "semen", "sex", "sexo", "sexy", "shemale", "shibari", "shit", "shitblimp", "shitty", "shota", "shrimping", "slanteye", "slut", "s&m", "smut", "snatch", "sodomize", "sodomy", "spic", "splooge", "spooge", "spunk", "strapon", "strappado", "swinger", "threesome", "throating", "tit", "tits", "titties", "titty", "topless", "tosser", "towelhead", "tranny", "tribadism", "tubgirl", "tushy", "twat", "twink", "upskirt", "urophilia", "vagina", "vibrator", "vorarephilia", "voyeur", "vulva", "wank", "wetback", "white power", "yaoi", "yiffy", "zoophilia"];

	// Functions
	bot.ensureUser = member => functions.ensureUser(member, bot);
	bot.fainted = (member, faintMessage) => functions.fainted(member, faintMessage, bot);
	bot.poisoned = (member, poisonMessage, poisonType) => functions.poisoned(member, poisonMessage, poisonType, bot);

	bot.spawnDementor = (channel) => functions.spawnDementor(channel, bot);
	bot.spawnBoggart = (channel) => functions.spawnBoggart(channel, bot);
	bot.spawnChest = (channel) => functions.spawnChest(channel, bot);
	bot.spawnTrainingSession = (channel, spell) => functions.spawnTrainingSession(channel, bot, spell);

	bot.processTrainingSession = (member, object, channel) => functions.processTrainingSession(member, object, channel, bot);

	bot.toCamelCase = functions.toCamelCase;
	bot.fromCamelCase = functions.fromCamelCase;
	bot.quickWebhook = quickWebhook;
	bot.timeUntilMidnight = functions.timeUntilMidnight;
	bot.getUserFromMention = functions.getUserFromMention;
	bot.capitalizeFirstLetter = functions.capitalizeFirstLetter;
	bot.isMazeChannel = functions.isMazeChannel;

	// Remove anyone that was in a fight from their fight.
	bot.userInfo.array().filter(u => u.mazeInfo.inFight).forEach(user => {
		bot.userInfo.set(`${user.guild}-${user.user}`, false, "mazeInfo.inFight");
	});

	// Set the bots activity
	bot.user.setActivity("Just Started, Sorry for the downtime!");

	// Set it to something else after 5 minutes
	setTimeout(async () => {
		bot.user.setActivity(`!help | Version ${botconfig.version}`);
	}, 300000);

	const faintedUsers = bot.userInfo.array().filter(u => u.stats.fainted);
	faintedUsers.forEach(user => {
		setTimeout(async () => {
			if (!bot.userInfo.get(`${user.guild}-${user.user}`, "stats.fainted")) return;

			bot.userInfo.set(`${user.guild}-${user.user}`, false, "stats.fainted");
			bot.userInfo.set(`${user.guild}-${user.user}`, 1, "stats.health");

			const hospitalChannel = await bot.guilds.get(user.guild).channels.find(c => c.name.includes("hospital"));
			const messages = await hospitalChannel.fetchMessages();

			const msg = messages.find(m => m.content.includes(user.user) && m.content.toLowerCase().includes("fainted"));
			if (msg) msg.delete();
		}, bot.timeUntilMidnight());
	});

	setInterval(() => {
		const guilds = bot.guildInfo.array();
		const users = bot.userInfo.array();

		guilds.forEach(guild => {

			if (guild.scheduledTrainingSessions.some(s => Date.now() >= s.time)) { // Training Sessions
				const trainingSession = guild.scheduledTrainingSessions.find(ts => Date.now() >= ts.time);
				bot.guildInfo.removeFrom(guild.guild, "scheduledTrainingSessions", trainingSession);

				const trainingChannel = bot.guilds.get(guild.guild).channels.find(c => c.name === "training-grounds");
				if (!trainingChannel) return;

				bot.spawnTrainingSession(trainingChannel, trainingSession.spell);
			}

			if (guild.spawns.some(s => s.type === "trivia" && (Date.now() - s.time) >= 600000)) { // Trivia questions
				const triviaQuestion = guild.spawns.find(s => s.type === "trivia" && (Date.now() - s.time) >= 600000);
				if (!triviaQuestion) return;

				bot.guildInfo.removeFrom(guild.guild, "spawns", triviaQuestion);

				const channel = bot.channels.get(triviaQuestion.channel);
				if (!channel) return;

				bot.quickWebhook(channel, "This trivia question has expired.", triviaQuestion.webhookObject);
			}
		});

		const reminderUsers = users.filter(u => u.reminders.length > 0);
		reminderUsers.forEach(u => {
			const reminder = u.reminders.find(r => Date.now() > r.time);
			if (!reminder) return;

			bot.userInfo.removeFrom(`${u.guild}-${u.user}`, "reminders", reminder);

			const user = bot.users.get(u.user);
			if (!user) return;

			user.send(reminder.reminder);
		});

		const flooPowderUsers = users.filter(u => u.trainingTokenUse && (Date.now() - u.trainingTokenUse) > 3600000);
		flooPowderUsers.forEach(user => {
			const guild = bot.guilds.get(user.guild);
			if (!guild) return;

			const role = guild.roles.find(r => r.name.toLowerCase() === "training");
			if (!role) return;

			const u = guild.members.get(user.user);
			u.removeRole(role);

			bot.userInfo.set(`${user.guild}-${user.user}`, null, "trainingTokenUse");
		});

		const mazeChannels = bot.channels.filter(c => c.type === "text" && c.name.endsWith("-forbidden-forest"));
		mazeChannels.forEach(async channel => {
			let message = await channel.fetchMessages({
				limit: 1
			});

			message = message.first();

			if (!message) return;

			if ((Date.now() - message.createdTimestamp) < 300000) return;

			const permissions = channel.permissionsFor(channel.guild.me);
			if (!permissions.has("MANAGE_CHANNELS")) return;

			channel.delete().catch(e => bot.logger.log("error", e.stack));
		});

		const activeEffectsUsers = users.filter(u => u.stats.activeEffects.length > 0);
		activeEffectsUsers.forEach(user => {
			const expirationTimes = {
				"floo powder": 3600000,
				"fire protection": 3600000,
				"luck": 3600000,
				"strength": 7200000
			};

			const activeEffects = user.stats.activeEffects.filter(e => (Date.now() - e.time) >= expirationTimes[e.type]);

			activeEffects.forEach(effect => {
				if (effect.type === "floo powder") {
					const guild = bot.guilds.get(user.guild);
					if (!guild) return;

					const role = guild.roles.find(r => r.name.toLowerCase() === "apparition");
					if (!role) return;

					const u = guild.members.get(user.user);
					u.removeRole(role);

					bot.logger.log("info", "Removed a user's floo powder role.");
				} else if (effect.type === "luck") {
					bot.userInfo.set(`${user.guild}-${user.user}`, 0, "stats.luck");
					bot.logger.log("info", "Removed a user's luck.");
				} else if (effect.type === "strength") {
					bot.userInfo.math(`${user.guild}-${user.user}`, "-", 2, "stats.defense");
					bot.logger.log("info", "Removed a users strength effect.");
				} else if (effect.type === "fire protection") {
					bot.logger.log("info", "Removed a user's fire protection effect.");
				}

				bot.userInfo.removeFrom(`${user.guild}-${user.user}`, "stats.activeEffects", effect);
			});
		});

		users.filter(u => u.stats.poisonedObject).forEach(user => {
			const poisonedObject = user.stats.poisonedObject;

			const timeObject = {
				"common": 7200000,
				"uncommon": 3600000
			};

			if ((Date.now() - poisonedObject.time) >= timeObject[poisonedObject.type]) {
				const guild = bot.guilds.get(user.guild);
				if (!guild) return;

				const member = guild.members.get(user.user);
				if (!member) return;

				bot.userInfo.dec(`${user.guild}-${user.user}`, "stats.maxHealth");
				bot.userInfo.set(`${user.guild}-${user.user}`, null, "stats.poisonedObject");
				bot.fainted(member, `${member} has succumbed to the poison and is now unconscious! Can you help me revive them?`);
			}
		});
	}, 30000);
};
