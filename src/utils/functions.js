const Discord = require("discord.js");
const moment = require("moment-timezone");
const quickWebhook = require("./quickWebhook.js");
const years = require("../jsonFiles/years.json");

module.exports = {
	ensureUser: function (user, bot) {
		// Wand stats
		const woodTypes = ["Acacia", "Alder", "Apple", "Ash", "Aspen", "Beech", "Blackthorn", "Black Walnut", "Cedar", "Cherry", "Chestnut", "Cypress", "Dogwood", "Ebony", "Elder", "Elm", "English Oak", "Fir", "Hawthorn", "Hazel", "Holly", "Hornbeam", "Latch", "Laurel", "Maple", "Pear", "Pine", "Poplar", "Red Oak", "Redwood", "Rowan", "Silver Lime", "Spruce", "Sycamore", "Vine", "Walnut", "Willow", "Yew"];
		const cores = ["Unicorn Hair", "Dragon Heartstring", "Phoenix Feather"];
		const lengths = ["9", "9 1/4", "9 1/2", "9 3/4", "10", "10 1/4", "10 1/2", "10 3/4", "11", "11 1/4", "11 1/2", "11 3/4", "12", "12 1/4", "12 1/2", "12 3/4", "13", "13 1/4", "13 1/2", "13 3/4", "14"];
		const flexibilities = ["Surprisingly Swishy", "Pliant", "Supple", "Reasonably Supple", "Quite Flexible", "Quite Bendy", "Slightly Yielding", "Slightly Springy", "Unbending", "Unyielding", "Brittle", "Rigid", "Solid", "Hard"];

		// Create the user's data if not there
		bot.userInfo.ensure(`${user.guild.id}-${user.id}`, {
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
				lastMerit: null,
				lastResurrectionStoneUse: null,
				lastStudy: null,
				nextWeekly: null
			},

			lifetimeEarnings: {
				knuts: 0,
				sickles: 0,
				galleons: 0
			},

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
				merits: 0,
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

	levelUp: function (bot, member, channel) {
		const guild = member.guild;
		const userData = bot.userInfo.get(`${guild.id}-${member.id}`);

		const lootbox = years[userData.year + 1].lootbox;

		for (let [key, value] of Object.entries(lootbox)) {
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

		const role = guild.roles.find(r => r.name.toLowerCase() === roleNames[userData.year].toLowerCase());
		const newRole = guild.roles.find(r => r.name.toLowerCase() === roleNames[userData.year + 1].toLowerCase());
		member.removeRole(role);
		member.addRole(newRole);

		bot.userInfo.inc(`${guild.id}-${member.id}`, "year");

		bot.userInfo.math(`${guild.id}-${member.id}`, "+", 2, "stats.health");
		bot.userInfo.math(`${guild.id}-${member.id}`, "+", 2, "stats.maxHealth");

		bot.userInfo.inc(`${guild.id}-${member.id}`, "stats.defense");
		bot.userInfo.inc(`${guild.id}-${member.id}`, "stats.attack");

		const lootboxContent = Object.entries(lootbox).map(i => `**${i[0].replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:** ${i[1]}`).join("\n");

		channel.send(`Congratulations ${member}! You've just leveled up to year ${userData.year + 1} and have a achieved a tier ${userData.year + 1} lootbox with the below content:\n${lootboxContent}`);
	},

	timeUntilMidnight: function () {
		const midnight = new Date();
		midnight.setHours(31, 0, 0, 0);

		const now = Date.now();
		const msToMidnight = midnight - now;
		return msToMidnight;
	},

	fainted: async function (member, faintMessage, bot) {
		const hospitalChannel = member.guild.channels.find(c => c.name.includes("hospital"));
		if (!hospitalChannel) return;

		const userData = bot.userInfo.get(`${member.guild.id}-${member.id}`);

		bot.userInfo.set(`${member.guild.id}-${member.id}`, true, "stats.fainted");

		const hospitalMessages = await hospitalChannel.fetchMessages();
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
		const hospitalChannel = member.guild.channels.find(c => c.name.includes("hospital"));
		if (!hospitalChannel) return;

		const poisonedObject = {
			type: poisonType,
			time: Date.now()
		};

		bot.userInfo.set(`${member.guild.id}-${member.id}`, poisonedObject, "stats.poisonedObject");

		const potionEmoji = bot.emojis.find(e => e.name.toLowerCase() === "potion");

		const msg = await bot.quickWebhook(hospitalChannel, poisonMessage, {
			username: "Madam Pomfrey",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/5/56/Madam_Pomfrey.png/revision/latest/scale-to-width-down/290?cb=20131110073338"
		});

		msg.react(potionEmoji);
	},

	awaitResponse: function (filter, time, channel, integerOnly) {
		// Return a Promise
		return new Promise((resolve, reject) => {

			// Create a message collector
			const messageCollector = new Discord.MessageCollector(channel, filter, {
				maxMatches: 1,
				time: time
			});

			// Whether or not a response has been collected
			let responseCollected = false;

			// If/when the message collector collects a message
			messageCollector.on("collect", collected => {
				if (isNaN(collected) && integerOnly) return channel.send("Only numbers are accepted!");
				// Set responseCollected to true and resolve the promise with the message
				responseCollected = true;
				resolve(collected);
				// Stop the message collector
				messageCollector.stop();
			});

			// When the message collector ends
			messageCollector.on("end", collected => {
				// If a message wasn't collected resolve the promise with undefined
				if (!responseCollected) resolve(undefined);
			});
		});
	},

	useResurrectionStone: function (bot, member, channel) {
		// Send the resurrection stone message
		channel.send(`Just as ${member} was about to be attacked, the spirit of their loved one appeared and protected them.`);
		// Set their last use to now
		bot.userInfo.set(`${member.guild.id}-${member.id}`, Date.now(), "cooldowns.lastResurrectionStoneUse");
		bot.log(`${member.displayName} used the resurrection stone.`, "info");
	},

	toCamelCase: function (string) {
		return string.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
	},

	fromCamelCase: function (string) {
		return string.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
	},

	capitalizeFirstLetter: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	capitalizeEveryFirstLetter: function (string) {
		return string.replace(/\b./g, m => m.toUpperCase());
	},

	isMazeChannel: function (channelName, user) {
		if (!channelName.includes(user.displayName.toLowerCase().replace(/[^a-z0-9+ ]+/gi, "").split(/ +/).join("-"))) return false;
		return true;
	},

	getUserFromMention: function (mention, guild) {
		if (!mention) return undefined;

		const matches = mention.match(/^<@!?(\d+)>$/);

		if (!matches) return undefined;

		const id = matches[1];
		const user = guild.members.get(id);

		if (!user) return undefined;
		return user;
	},

	spawnDementor: function (channel, bot) {
		const object = {
			channel: channel.id,
			type: "dementor"
		};

		const guild = channel.guild;
		const guildData = bot.guildInfo.get(guild.id);

		const attachment = new Discord.Attachment("../images/spawns/dementor.jpg", "dementor.jpg");
		channel.send(`A dementor has spawned! Years 5 and up can banish it by using \`${bot.prefix}expecto patronum\`!`, attachment);

		if (guildData.spawns.some(s => s.channel === object.channel)) bot.guildInfo.removeFrom(guild.id, guildData.spawns.find(s => s.channel === object.channel), "spawns");
		bot.guildInfo.push(guild.id, object, "spawns");
	},

	spawnBoggart: function (channel, bot) {
		const object = {
			channel: channel.id,
			type: "boggart"
		};

		const guild = channel.guild;
		const guildData = bot.guildInfo.get(guild.id);

		const attachment = new Discord.Attachment("../images/spawns/boggart.jpg", "boggart.jpg");
		channel.send(`A boggart has spawned! Years 3 and up can banish it by using \`${bot.prefix}riddikulus\`!`, attachment);

		if (guildData.spawns.some(s => s.channel === object.channel)) bot.guildInfo.removeFrom(guild.id, guildData.spawns.find(s => s.channel === object.channel), "spawns");
		bot.guildInfo.push(guild.id, object, "spawns");
	}
};
