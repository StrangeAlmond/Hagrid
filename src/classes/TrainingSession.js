const Discord = require("discord.js");
const info = require("../jsonFiles/training_sessions/info.json");
const beasts = require("../jsonFiles/training_sessions/beasts.json");
const spells = require("../jsonFiles/spells.json");

class TrainingSession {
	constructor(bot, channel) {
		this.bot = bot;
		this.channel = channel;

		this.guild = channel.guild;
	}

	async spawnTrainingSession(filter) {
		const object = {
			channel: this.channel.id,
			guild: this.guild.id,
			time: Date.now(),
			type: "trainingSession",
			users: []
		};

		const guildData = this.bot.guildInfo.get(this.guild.id);

		const beastNames = beasts.map(b => b.name.toLowerCase());
		const beastSpells = beasts.map(b => b.spell.slice(1).toLowerCase());

		const validFilter = (beastNames.includes(filter) || beastSpells.includes(filter));
		const possibleBeasts = validFilter ? beasts.filter(b => b.name.toLowerCase() == filter || b.spell.slice(1).toLowerCase() == filter) : beasts;

		const beast = possibleBeasts[Math.floor(Math.random() * possibleBeasts.length)];
		object.beast = beast;

		if (guildData.spawns.some(s => s.channel === object.channel)) guildData.spawns.splice(guildData.spawns.findIndex(s => s.channel === object.channel), 1);
		guildData.spawns.push(object);

		this.bot.guildInfo.set(this.guild.id, guildData.spawns, "spawns");

		const image = beast.image;
		const spawnMsg = `A ${beast.name} has been released into the ${this.channel}!
        **Spell:** ${beast.spell.slice(1)} (${spells.find(s => s.spellName === beast.spell.slice(1)).name})
        **Attack Power:** ${beast.attack}
        **HP:** ${beast.health}

        Use the \`${this.bot.prefix}use training token\` to participate in this training sesssion!
        ${beast.notes ? `**${beast.notes}**` : ""}`;

		const role = this.guild.roles.find(r => r.name.toLowerCase() == beast.spell.slice(1).toLowerCase());

		const embed = new Discord.RichEmbed()
			.setDescription(spawnMsg)
			.setImage(image)
			.setColor(beast.color)
			.setTimestamp();

		const greatHall = this.guild.channels.find(c => c.name === "great-hall");
		if (!greatHall) throw new Error("Couldn't find the great hall channel!");

		const msg = await greatHall.send(role, embed);
		msg.react("⚔");

		const attachment = new Discord.Attachment(beast.image, `${beast.name}.png`);

		await this.channel.send(attachment);
		await this.channel.send(`A ${beast.name} has spawned! use ${this.bot.prefix}${beast.spell.slice(1)} to help defeat it!\n${beast.notes ? `**${beast.notes}**` : ""}`);

		return object;
	}

	async processTrainingSession(member, object) {
		const guildData = this.bot.guildInfo.get(this.guild.id);
		const userData = this.bot.userInfo.get(`${this.guild.id}-${member.id}`);

		if (!userData.studiedSpells.includes(object.beast.spell.slice(1)) || userData.stats.fainted) return;
		if (object.beast.name.toLowerCase() == "ashwinder" && !userData.stats.activeEffects.some(e => e.type.toLowerCase() == "fire protection")) return;

		if (!object.users.some(u => u.id == member.id)) {
			object.users.push({
				id: member.id,
				damageDealt: 0
			});

			const newRateLimit = 2 * object.users.length;
			this.channel.setRateLimitPerUser(newRateLimit, "Dynamic slow mode.");
		}

		const user = object.users.find(u => u.id == member.id);

		let webhooks = await this.channel.fetchWebhooks();
		webhooks = webhooks.array().filter(w => w.name.toLowerCase() == this.bot.user.username.toLowerCase());

		if (webhooks.length < 7) {
			for (let i = webhooks.length; i < 7; i++) {
				const webhook = await this.channel.createWebhook(this.bot.user.username, this.bot.user.displayAvatarURL);
				webhooks.push(webhook);
			}
		}

		const webhook = webhooks[Math.floor(Math.random() * webhooks.length)];
		let msgContent = "";

		const missChances = info.missChances;
		const missChance = missChances[object.beast.class][userData.year];
		const chanceToMiss = Math.random() * 100;

		const felixFelicisActive = userData.stats.activeEffects.some(e => e.type == "luck");

		if (chanceToMiss <= missChance && !felixFelicisActive) {
			msgContent += `${member.displayName}, you try to cast ${object.beast.spell.slice(1)} but miss and deal 0 damage.\n`;
		} else {
			let damageDealt = userData.stats.attack > object.beast.defense ? userData.stats.attack - object.beast.defense : 0;

			if (damageDealt > object.beast.health) damageDealt = object.beast.health;

			user.damageDealt += damageDealt;
			object.users[object.users.find(u => u.id === member.id)] = user;

			object.beast.health -= damageDealt;

			guildData.spawns.splice(guildData.spawns.findIndex(s => s.channel == object.channel), 1, object);
			this.bot.guildInfo.set(this.guild.id, guildData.spawns, "spawns");

			this.bot.userInfo.math(`${this.guild.id}-${member.id}`, "+", damageDealt, "xp");
			this.bot.userInfo.math(`${this.guild.id}-${member.id}`, "+", damageDealt, "stats.trainingSessionDamage");

			msgContent += `${member.displayName}, You cast ${object.beast.spell.slice(1)} for ${damageDealt} damage.\nThe beast has ${object.beast.health} health left.\n`;
		}

		if (object.beast.health <= 0) {
			webhook.send(`Great job ${member}! you defeated the ${object.beast.name.toLowerCase()}, as a result, you have been awarded one sickle.`);
			return this.endTrainingSession(object, webhook, member);
		}

		const chanceToBeAttacked = Math.random() * 100;
		if (chanceToBeAttacked <= 20) {
			const damage = object.beast.attack > userData.stats.defense ? object.beast.attack - userData.stats.defense : 0;

			userData.stats.health -= damage;
			this.bot.userInfo.math(`${this.guild.id}-${member.id}`, "-", damage, "stats.health");

			if (userData.stats.health <= 0) {
				if (userData.inventory.resurrectionStone > 1 && (Date.now() - userData.cooldowns.lastResurrectionStoneUse) > 3600000) {
					msgContent += `Just as ${member} was about to be attacked, the spirit of their loved one appeared and protected them.`;

					this.bot.userInfo.math(`${this.guild.id}-${member.id}`, "+", damage, "stats.health");
					this.bot.userInfo.set(`${this.guild.id}-${member.id}`, Date.now(), "cooldowns.lastResurrectionStoneUse");
				} else {
					msgContent += `${member}, you have fainted!`;
					this.bot.fainted(member, `${member} has fainted from a ${object.beast.name.toLowerCase()} attack! can you help me heal them faster?`, this.bot);
				}
			} else {
				msgContent += `${member}, the ${object.beast.name.toLowerCase()} attacked you! you have ${userData.stats.health} health points left.`;
			}
		}

		webhook.send(msgContent);
		return object;
	}

	endTrainingSession(object, webhook, member) {
		const guildData = this.bot.guildInfo.get(this.guild.id);
		const lootboxData = info.lootboxes;

		guildData.spawns.splice(guildData.spawns.findIndex(s => s.channel === object.channel), 1);
		this.bot.guildInfo.set(this.guild.id, guildData.spawns, "spawns");

		this.channel.setRateLimitPerUser(0, "Training session ended.");

		this.bot.userInfo.inc(`${this.guild.id}-${member.id}`, "balance.sickles");
		this.bot.userInfo.inc(`${this.guild.id}-${member.id}`, "stats.trainingSessionsDefeated");

		object.users = object.users.sort((a, b) => b.damageDealt - a.damageDealt);

		const beast = beasts.find(b => b.name == object.beast.name);

		let msg = "";
		msg += `**XP Given:**\n${object.users.map(u => `${this.guild.members.get(u.id).displayName}, you got ${u.damageDealt} XP!`).join("\n")}\n\n**Lootboxes Given:**\n`;

		object.users.forEach(u => {
			let lootbox;
			let lootboxTier;

			if (u.damageDealt >= (beast.health / 4)) {
				lootbox = lootboxData.tiers[`${beast.class.length + 2}`];
				lootboxTier = beast.class.length + 2;
			} else if (u.damageDealt >= (beast.health / 10)) {
				lootbox = lootboxData.tiers[`${beast.class.length + 1}`];
				lootboxTier = beast.class.length + 1;
			} else if (u.damageDealt >= (beast.health / 25)) {
				lootbox = lootboxData.tiers[`${beast.class.length}`];
				lootboxTier = beast.class.length;
			} else {
				lootbox = lootboxData.tiers[`${beast.class.length - 1}`];
				lootboxTier = beast.class.length - 1;
			}

			lootbox = lootbox.map(r => lootboxData[r][Math.floor(Math.random() * lootboxData[r].length)]);

			if (beast.name.toLowerCase() == "doxy") lootbox.push("1 inventory.doxyEggs");
			if (beast.name.toLowerCase() == "ashwinder") lootbox.push("1 inventory.ashwinderEggs");

			lootbox.forEach(reward => {
				reward = reward.split(/ +/);
				const item = reward[1];
				const amount = parseInt(reward[0]);

				if (!this.bot.userInfo.hasProp(`${this.guild.id}-${member.id}`, item)) this.bot.userInfo.set(`${this.guild.id}-${member.id}`, 0, item);

				this.bot.userInfo.math(`${this.guild.id}-${member.id}`, "+", amount, item);
			});

			msg += `**${this.guild.members.get(u.id).displayName}**, you got a tier ${lootboxTier} lootbox! the contents are below:\n${lootbox.map(r => `${r.split(/ +/)[0]} ${this.bot.fromCamelCase(r.split(/ +/)[1].split(".")[1])}`).join("\n")}\n\n`;

			if (msg.length > 1800) {
				webhook.send(msg);
				msg = "";
			}
		});

		webhook.send(msg);

		const greatHall = this.guild.channels.find(c => c.name == "great-hall");
		greatHall.send("**This training session has ended**");
	}
}

module.exports = TrainingSession;
