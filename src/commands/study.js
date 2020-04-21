const Discord = require("discord.js");
const moment = require("moment-timezone");
const ms = require("parse-ms");
let spells = require("../jsonFiles/spells.json");

spells = spells.sort((a, b) => {
	if (a.yearRequired > b.yearRequired) return 1;
	if (a.yearRequired < b.yearRequired) return -1;

	if (a.name > b.name) return 1;
	if (a.name < b.name) return -1;
});

for (let i = 0; i < spells.length; i++) {
	spells[i].id = i + 1;
}

module.exports = {
	name: "study",
	description: "Study a spell or view the spells you can study.",
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);
		const timeTillNextStudy = bot.functions.parseMs(bot.functions.timeUntilMidnight(), true);

		if (!args[0]) {
			const studiedSpells = userData.studiedSpells;
			const unstudiedSpells = spells.filter(s => s.yearRequired <= userData.year &&
				!studiedSpells.includes(s.spellName));

			const pages = [];
			const classesFound = [];

			unstudiedSpells.forEach(spell => {
				if (classesFound.includes(spell.class)) return;

				const classSpells = unstudiedSpells
					.filter(s => s.class == spell.class)
					.map(s => spellEntry(s)).join("\n\n");

				const nextStudyTime = userData.cooldowns.lastStudy == moment.tz("America/Los_Angeles").format("l") ?
					`You can study again in ${timeTillNextStudy.hours} hours, ${timeTillNextStudy.minutes} minutes, and ${timeTillNextStudy.seconds} seconds` :
					`Use ${bot.prefix}study <spell id> to study a spell`;

				const embed = new Discord.MessageEmbed()
					.setTitle(spell.class)
					.setDescription(classSpells)
					.setColor(message.member.displayHexColor)
					.setFooter(nextStudyTime)
					.setTimestamp();
				pages.push(embed);
				classesFound.push(spell.class);
			});

			if (!pages[0]) {
				return message.channel.send("There are no spells available for you to study.");
			}

			const msg = await message.channel.send(pages[0]);

			if (pages.length == 1) return;

			await msg.react("◀");
			await msg.react("▶");

			let page = 1;

			const filter = (reaction, user) => ["◀", "▶"].includes(reaction.emoji.name) && user.id == message.author.id;
			const reactionCollector = msg.createReactionCollector(filter, {
				time: 120000
			});

			reactionCollector.on("collect", async collected => {
				if (collected.emoji.name == "◀") {
					if (page == 1) {
						return msg.reactions.cache.find(r => r.emoji.name == "◀").users.remove(message.author);
					}

					page--;
					msg.edit(pages[page - 1]);

					msg.reactions.cache.find(r => r.emoji.name == "◀").users.remove(message.author);
				} else if (collected.emoji.name == "▶") {
					if (page == pages.length) {
						return msg.reactions.cache.find(r => r.emoji.name == "▶").users.remove(message.author);
					}

					page++;
					msg.edit(pages[page - 1]);

					msg.reactions.cache.find(r => r.emoji.name == "▶").users.remove(message.author);
				}
			});

			reactionCollector.on("end", () => {
				msg.reactions.removeAll();
				pages[page - 1].setFooter("This reaction menu has expired.");
				msg.edit(pages[page - 1]);
			});

			return;
		}

		const spell = spells.find(s => s.spellName.includes(args.join(" ")) ||
			s.name.toLowerCase().includes(args.join(" ")) ||
			s.id == parseInt(args[0]));

		if (!spell) return message.channel.send("Invalid spell!");

		if (spell.yearRequired > userData.year) return;

		const lastStudy = userData.cooldowns.lastStudy;
		const studiedSpells = userData.studiedSpells;
		if (studiedSpells.includes(spell.spellName)) return message.channel.send("You've already studied this spell!");

		const today = moment.tz("America/Los_Angeles").format("l");

		if (lastStudy == today) {
			return message.channel.send(`You can study again in ${timeTillNextStudy.hours} hours, ${timeTillNextStudy.minutes} minutes, and ${timeTillNextStudy.seconds} seconds`);
		}

		if (!userData.spellInfo[spell.spellName]) {
			bot.userInfo.set(message.author.key, spell, `spellInfo.${spell.spellName}`);
			userData.spellInfo[spell.spellName] = Object.assign({}, spell);
		}

		userData.spellInfo[spell.spellName].daysToLearn--;
		bot.userInfo.dec(message.author.key, `spellInfo.${spell.spellName}.daysToLearn`);
		bot.userInfo.set(message.author.key, today, "cooldowns.lastStudy");

		if (userData.spellInfo[spell.spellName].daysToLearn <= 0) {
			if (["herbology", "care of magical creatures"].includes(spell.class.toLowerCase())) { // Herbology and Care of Magical Creatures give items instead of spells.
				const amount = parseInt(spell.reward.split(/ +/)[0]);
				const item = spell.reward.split(/ +/)[1];

				if (!userData.inventory[item]) {
					bot.userInfo.set(message.author.key, 0, `inventory.${item}`);
				}

				bot.userInfo.math(message.author.key, "+", amount, `inventory.${item}`);
				message.channel.send(`Congratulations ${message.member.displayName}! You have finished studying ${spell.name} and have gained ${amount} ${spell.spellName}`);
			} else {
				bot.userInfo.push(message.author.key, spell.spellName, "studiedSpells");

				const role = message.guild.roles.cache.find(s => s.spellName == s.name.toLowerCase());
				if (role && userData.settings.trainingSessionAlerts) message.member.roles.add(role);

				message.channel.send(`Congratulations ${message.member.displayName}! You have finished learning the **${spell.name}**!`);
			}

			delete userData.spellInfo[spell.spellName];
			return bot.userInfo.delete(message.author.key, `spellInfo.${spell.spellName}`);
		}

		message.channel.send(`You have studied the **${spell.name}**, you have ${userData.spellInfo[spell.spellName].daysToLearn} days left until you learn this spell!`);

		function findType(s) {
			if (["herbology", "care of magical creatures"].includes(s.class.toLowerCase())) {
				return "Item";
			} else if (["potions"].includes(s.class.toLowerCase())) {
				return "Potion";
			} else {
				return "Spell";
			}
		}

		function spellEntry(s) {
			return `**${findType(s)}:** ${userData.spellInfo[s.spellName] ? `**__${s.name}__**` : s.name} (${bot.functions.capitalizeFirstLetter(s.spellName)})
			**ID:** ${s.id}
			**Days to Learn:** ${userData.spellInfo[s.spellName] ? userData.spellInfo[s.spellName].daysToLearn : s.daysToLearn}`;
		}
	},
};
