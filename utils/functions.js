const Discord = require("discord.js");
const moment = require("moment-timezone");
const quickWebhook = require("./quickWebhook.js");

const beasts = require("../jsonFiles/beasts.json");
const spells = require("../jsonFiles/spells.json");

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

	toCamelCase: function (string) {
		return string.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
	},

	fromCamelCase: function (string) {
		return string.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
	},

	capitalizeFirstLetter: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
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

		const attachment = new Discord.Attachment("./images/spawns/dementor.jpg", "dementor.jpg");
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

		const attachment = new Discord.Attachment("./images/spawns/boggart.jpg", "boggart.jpg");
		channel.send(`A boggart has spawned! Years 3 and up can banish it by using \`${bot.prefix}riddikulus\`!`, attachment);

		if (guildData.spawns.some(s => s.channel === object.channel)) bot.guildInfo.removeFrom(guild.id, guildData.spawns.find(s => s.channel === object.channel), "spawns");
		bot.guildInfo.push(guild.id, object, "spawns");
	},

	spawnChest: function (channel, bot) {
		const object = {
			channel: channel.id,
			type: "chest"
		};

		const guild = channel.guild;
		const guildData = bot.guildInfo.get(guild.id);

		const attachment = new Discord.Attachment("./images/spawns/chest.png", "chest.png");
		channel.send(`A chest has appeared! open it with\`${bot.prefix}cistem aperio\`!`, attachment);

		if (guildData.spawns.some(s => s.channel === object.channel)) bot.guildInfo.removeFrom(guild.id, guildData.spawns.find(s => s.channel === object.channel), "spawns");
		bot.guildInfo.push(guild.id, object, "spawns");
	},

	spawnTrainingSession: async function (channel, bot, filter) {
		const object = {
			channel: channel.id,
			time: Date.now(),
			type: "training session",
			users: []
		};

		const guild = channel.guild;
		const guildData = bot.guildInfo.get(guild.id);

		const possibleBeasts = beasts.find(b => b.spell.slice(1) === filter || b.name.toLowerCase() === filter) ? beasts.filter(b => b.spell.slice(1) === filter || b.name.toLowerCase() === filter) : beasts;
		const beast = possibleBeasts[Math.floor(Math.random() * possibleBeasts.length)];

		object.beast = beast;

		if (guildData.spawns.some(s => s.channel === object.channel)) guildData.spawns.splice(guildData.spawns.findIndex(s => s.channel === object.channel), 1);

		guildData.spawns.push(object);
		bot.guildInfo.set(guild.id, guildData.spawns, "spawns");

		const image = beast.image;
		const msg = `A ${beast.name} is ready in the ${channel}!
			**Spell:** ${beast.spell.slice(1)} (${spells.find(s => s.spellName === beast.spell.slice(1)).name})
			**Attack Power:** ${beast.attack}
			**HP:** ${beast.health}
			
			Use \`${bot.prefix}${beast.spell.slice(1)}\` to participate in this training session!
			${beast.notes ? `**${beast.notes}**` : ""}`;

		const role = guild.roles.find(r => r.name.toLowerCase() === beast.spell.slice(1));

		const embed = new Discord.RichEmbed()
			.setDescription(msg)
			.setImage(image)
			.setColor(beast.color)
			.setTimestamp();

		const greatHall = guild.channels.find(c => c.name === "great-hall");
		if (!greatHall) return;

		const m = await greatHall.send(role, embed);

		m.react("⚔");

		const attachment = new Discord.Attachment(beast.image, `${beast.name}.png`);

		await channel.send(attachment);
		channel.send(`A ${beast.name} has spawned! Use ${bot.prefix}${beast.spell.slice(1)} to help defeat it!\n${beast.notes ? `**${beast.notes}**` : ""}`);
	},

	processTrainingSession: async function (member, object, channel, bot) {
		const guild = member.guild;
		const guildData = bot.guildInfo.get(guild.id);
		const userData = bot.userInfo.get(`${guild.id}-${member.id}`);

		if (!userData.studiedSpells.includes(object.beast.spell.slice(1)) || userData.stats.fainted) return;

		if (object.beast.name.toLowerCase() === "ashwinder" && !userData.stats.activeEffects.some(a => a.type.toLowerCase() === "fire protection")) return;

		if (!object.users.some(u => u.id === member.id)) {
			object.users.push({
				id: member.id,
				damageDealt: 0
			});
		}

		const user = object.users.find(u => u.id === member.id);

		let damageDealt = userData.stats.attack - object.beast.defense;
		if (damageDealt < 0) damageDealt = 0;

		user.damageDealt += damageDealt;
		object.users[object.users.find(u => u.id === member.id)] = user;

		object.beast.health -= damageDealt;

		guildData.spawns.splice(guildData.spawns.findIndex(s => s.channel === object.channel), 1, object);
		bot.guildInfo.set(guild.id, guildData.spawns, "spawns");

		let webhooks = await channel.fetchWebhooks();
		webhooks = webhooks.array().filter(w => w.name.toLowerCase() === bot.user.username.toLowerCase());

		if (webhooks.length < 7) {
			for (let i = webhooks.length; i < 7; i++) {
				const webhook = await channel.createWebhook(bot.user.username, bot.user.displayAvatarURL);
				webhooks.push(webhook);
			}
		}

		const webhook = webhooks[Math.floor(Math.random() * webhooks.length)];

		let msgContent = "";

		bot.userInfo.math(`${guild.id}-${member.id}`, "+", damageDealt, "xp");
		bot.userInfo.math(`${guild.id}-${member.id}`, "+", damageDealt, "stats.trainingSessionDamage");

		if (object.beast.health <= 0) {

			const lootBoxData = {
				"A": ["8 balance.knuts", "9 balance.knuts", "10 balance.knuts", "11 balance.knuts", "12 balance.knuts"],
				"B": ["16 balance.knuts", "17 balance.knuts", "18 balance.knuts", "19 balance.knuts", "20 balance.knuts", "21 balance.knuts", "22 balance.knuts", "23 balance.knuts", "24 balance.knuts"],
				"C": ["1 balance.sickles", "2 balance.sickles", "3 balance.sickles"],
				"D": ["4 balance.sickles", "5 balance.sickles", "6 balance.sickles"],
				"E": ["8 balance.sickles", "9 balance.sickles", "10 balance.sickles"],
				"F": ["14 balance.sickles", "16 balance.sickles", "1 balance.galleons"],
				"G": ["1 balance.galleons", "2 balance.galleons"],
				"T": ["1 inventory.boomBerryJuice", "1 inventory.chizpurfleFangs", "1 inventory.dropsOfHoneywater", "1 inventory.moondewDrops", "1 inventory.slothBrainMucus"],
				"U": ["1 inventory.billywigStingSlime", "1 inventory.boomBerryJuice", "1 inventory.bottleOfHorklumpJuice", "1 inventory.chizpurfleFangs", "1 inventory.dropsOfHoneywater", "1 inventory.lionfishSpines", "1 inventory.moondewDrops", "1 inventory.slothBrainMucus", "1 inventory.sprigOfWolfsbane", "1 inventory.stewedMandrake", "1 inventory.pinchOfUnicornHorn", "1 inventory.vialOfFlobberwormMucus", "1 inventory.vialOfSalamanderBlood", "1 inventory.bezoar", "1 inventory.standardIngredients"],
				"V": ["1 inventory.snakeFangs", "1 inventory.billywigStingSlime", "1 inventory.bottleOfHorklumpJuice", "1 inventory.sprigOfWolfsbane", "1 inventory.stewedMandrake", "1 inventory.sprigOfWolfsbane", "1 inventory.stewedMandrake", "1 inventory.pinchOfUnicornHorn", "1 inventory.vialOfFlobberwormMucus", "1 inventory.vialOfSalamanderBlood", "1 inventory.bezoar", "1 inventory.standardIngredients"],
				"W": ["1 inventory.snakeFangs", "1 inventory.bezoar", "1 inventory.standardIngredients"],
				"X": ["1 inventory.snakeFangs", "1 inventory.tinctureOfThyme"],
				"Y": ["1 inventory.wiggenweldPotion", "1 inventory.revivePotion", "1 inventory.antidoteToCommonPoisons"],
				"Z": ["1 inventory.wiggenweldPotion", "1 inventory.revivePotion", "1 inventory.antidoteToCommonPoisons"],

				"tiers": {
					"2": ["B", "T", "U"],
					"3": ["C", "U", "V"],
					"4": ["D", "U", "V", "W"],
					"5": ["E", "U", "V", "W", "X"],
					"6": ["F", "X", "Y"],
					"7": ["G", "X", "Y", "Z"]
				}
			};

			guildData.spawns.splice(guildData.spawns.findIndex(s => s.channel === object.channel), 1);
			bot.guildInfo.set(guild.id, guildData.spawns, "spawns");

			webhook.send(`Great job ${member}! you defeated the ${object.beast.name.toLowerCase()}, as a result, you have been awarded one sickle.`);

			bot.userInfo.inc(`${guild.id}-${member.id}`, "stats.trainingSessionsDefeated");

			object.users = object.users.sort((a, b) => b.damageDealt - a.damageDealt);

			const beast = beasts.find(b => b.name === object.beast.name);

			let msg = "";

			msg += `**XP Given:**\n${object.users.map(u => `${guild.members.get(u.id).displayName}, you got ${u.damageDealt} XP!`).join("\n")}\n\n**Lootboxes Given:**\n`;

			object.users.forEach(u => {
				let lootbox;
				let lootboxTier;

				if (u.damageDealt >= (beast.health / 4)) {
					lootbox = lootBoxData.tiers[`${beast.class.length + 2}`];
					lootboxTier = beast.class.length + 2;
				} else if (u.damageDealt >= (beast.health / 10)) {
					lootbox = lootBoxData.tiers[`${beast.class.length + 1}`];
					lootboxTier = beast.class.length + 1;
				} else if (u.damageDealt >= (beast.health / 25)) {
					lootbox = lootBoxData.tiers[`${beast.class.length}`];
					lootboxTier = beast.class.length;
				} else {
					lootbox = lootBoxData.tiers[`${beast.class.length - 1}`];
					lootboxTier = beast.class.length - 1;
				}

				lootbox = lootbox.map(r => lootBoxData[r][Math.floor(Math.random() * lootBoxData[r].length)]);

				if (beast.name.toLowerCase() === "doxy") lootbox.push("1 inventory.doxyEggs");
				if (beast.name.toLowerCase() === "ashwinder") lootbox.push("1 inventory.ashwinderEggs");

				lootbox.forEach(reward => {
					reward = reward.split(/ +/);
					const item = reward[1];
					const amount = parseInt(reward[0]);

					if (!bot.userInfo.hasProp(`${guild.id}-${member.id}`, item)) bot.userInfo.set(`${guild.id}-${member.id}`, 0, item);

					bot.userInfo.math(`${guild.id}-${member.id}`, "+", amount, item);
				});

				msg += `**${guild.members.get(u.id).displayName}**, you got a tier ${lootboxTier} lootbox! the contents are below:\n${lootbox.map(r => `${r.split(/ +/)[0]} ${this.fromCamelCase(r.split(/ +/)[1].split(".")[1])}`).join("\n")}\n\n`;

				if (msg.length > 1800) {
					webhook.send(msg);
					msg = "";
				}

			});

			webhook.send(msg);

			const greatHall = guild.channels.find(c => c.name === "great-hall");
			greatHall.send("**This training session has ended**");

			return;
		}

		msgContent += `${member.displayName}, You cast ${bot.prefix}${object.beast.spell.slice(1)} for ${damageDealt} damage.\nThe beast has ${object.beast.health} health left.\n`;

		const chanceForAttack = Math.random() * 100;

		if (chanceForAttack <= 20) {
			let damage = object.beast.attack - userData.stats.defense;
			if (damage < 0) damageDealt = 0;

			userData.stats.health -= damage;
			bot.userInfo.set(`${guild.id}-${member.id}`, userData.stats.health, "stats.health");

			if (userData.stats.health <= 0) {
				if (userData.inventory.resurrectionStone > 1 && (Date.now() - userData.cooldowns.lastResurrectionStoneUse) > 3600000) {
					msgContent += `Just as ${member} was about to be attacked, the spirit of their loved one appeared and protected them.`;

					bot.userInfo.math(`${guild.id}-${member.id}`, "+", damage, "stats.health");
					bot.userInfo.set(`${guild.id}-${member.id}`, Date.now(), "cooldowns.lastResurrectionStoneUse");
				} else {
					msgContent += `${member}, you have fainted!`;
					this.fainted(member, `${member} has fainted from a ${object.beast.name.toLowerCase()} attack! can you help me heal them faster?`, bot);
				}
			} else {
				msgContent += `${member}, the ${object.beast.name.toLowerCase()} attacked you! you have ${userData.stats.health} health points left.`;
			}
		}

		webhook.send(msgContent);

		return;
	}
};
