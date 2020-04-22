const Discord = require("discord.js");
const moment = require("moment-timezone");
const badges = require("../jsonFiles/badges.json");
const petImages = require("../jsonFiles/petImages.json");

module.exports = {
	name: "pet",
	description: "View your pet, Feed your pet, or change your pet's name",
	aliases: ["pets"],
	async execute(message, args, bot) {
		const userData = bot.userInfo.get(message.author.key);

		const pets = userData.pets.filter(p => !p.retired);
		const pet = pets[0];

		if (pets.length <= 0) return message.channel.send("You don't have a pet!");
		if (pet.fainted && args[0]) return message.channel.send("Your pet has fainted. You can revive your pet with **stinksap**.");

		const lastFeed = pet.lastFeed;
		const starveDate = moment.tz(new Date(lastFeed), "America/Los_Angeles");
		const lastFeedObj = bot.functions.parseMs(Date.now() - starveDate.valueOf(), true);

		if (lastFeed && lastFeedObj.days >= 8) {
			userData.pets.splice(userData.pets.findIndex(p => p.id == pet.id), 1);
			bot.userInfo.set(message.author.key, userData.pets, "pets");
			return message.channel.send(`Sorry ${message.author}, I'm gonna have to take yer ${pet.pet} away. Very disappointin' to see you neglect little ${pet.nickname} like that. When yer ready to care fer a pet again, you can go back to Diagon Alley and buy a new one.`);
		}

		if (lastFeed && lastFeedObj.days >= 3 && !pet.fainted) {
			message.channel.send("Your pet has fainted after days of neglect!");
			pet.fainted = true;
			userData.pets.splice(userData.pets.findIndex(p => p.id == pet.id), 1, pet);
			return bot.userInfo.set(message.author.key, userData.pets, "pets");
		}

		if (!args[0]) {
			userData.pets = userData.pets.sort((a, b) => {
				if (a.retired && !b.retired) return 1;
				if (b.retired && !a.retired) return -1;

				if (a.retired && b.retired) return 0;
			});

			const pages = [];

			for (let i = 0; i < userData.pets.length; i++) {
				const p = userData.pets[i];
				const lf = p.lastFeed;
				const sd = moment.tz(new Date(lf), "America/Los_Angeles");
				const lfo = bot.functions.parseMs(Date.now() - sd.valueOf());

				const image = petImages[bot.functions.toCamelCase(p.pet.toLowerCase())];

				let petHappiness = "";
				const today = moment.tz("America/Los_Angeles").format("l");

				if (lf && lfo.hours >= 24) {
					petHappiness = "Starving";
				} else if (lf && lf != today) {
					petHappiness = "Hungry";
				} else if (lf == null) {
					petHappiness = "Hungry";
				} else if (lf && lf == today) {
					petHappiness = "Full";
				}

				if (p.fainted) petHappiness = "Fainted";

				const embed = new Discord.MessageEmbed()
					.setAuthor(p.nickname, message.author.displayAvatarURL())
					.setThumbnail(image)
					.setDescription(`**Pet XP:** ${p.xp}\n**Pet Status:** ${petHappiness}\n**Level:** ${p.level}\n**Gender:** ${bot.functions.capitalizeFirstLetter(p.gender)}\n\n${p.retired ? "*This pet is retired*" : ""}`)
					.setColor(message.member.displayHexColor)
					.setTimestamp();

				pages.push(embed);
			}

			let embed = pages[0];

			if (pages.length == 1) return message.channel.send(embed);

			const msg = await message.channel.send(embed);

			let page = 1;

			await msg.react("◀");
			await msg.react("▶");

			const filter = (reaction, u) => ["◀", "▶"].includes(reaction.emoji.name) && u.id == message.author.id;
			const reactionCollector = msg.createReactionCollector(filter, {
				time: 120000
			});

			reactionCollector.on("collect", async collected => {
				if (collected.emoji.name == "▶") {
					if (page == pages.length) {
						return msg.reactions.cache.last().users.remove(message.author);
					}

					page++;

					embed = pages[page - 1];
					await msg.edit(embed);

					msg.reactions.cache.last().users.remove(message.author);
				} else if (collected.emoji.name == "◀") {
					if (page == 1) {
						return msg.reactions.cache.first().users.remove(message.author);
					}

					page--;

					embed = pages[page - 1];

					await msg.edit(embed);
					msg.reactions.cache.first().users.remove(message.author);
				}
			});

			reactionCollector.on("end", async () => {
				embed = pages[page - 1];
				embed.setFooter("This reaction menu has expired.");
				await msg.edit(embed);
			});

		} else if (args[0] == "feed") {
			if (!pet) {
				return message.channel.send("It seems you don't have a pet to feed. You can purchase a pet at the **Magical Menagerie**");
			}

			const petYear = pet.level;
			let petXp = pet.xp;

			if (petXp >= 365) return message.channel.send("It seems your pet isn't hungry!");

			const msToMidnight = bot.functions.timeUntilMidnight();
			if (lastFeed == moment.tz("America/Los_Angeles").format("l")) {
				const timeObj = bot.functions.parseMs(msToMidnight);
				return message.channel.send(`${message.member}, You can feed your pet again in ${timeObj.hours}h, ${timeObj.minutes}m, ${timeObj.seconds}s.`);
			}

			pet.xp++;
			petXp++;

			const levelUps = {
				1: 7,
				2: 15,
				3: 28,
				4: 52,
				5: 90,
				6: 180
			};

			if (petXp >= levelUps[petYear]) {
				message.channel.send(`Your pet is now level ${petYear + 1}!`);
				pet.level++;

				if ((petYear + 1) == 7) {
					const badge = badges.find(b => b.name.toLowerCase() == "care of magical creatures badge"); // Care of magical creatures badge

					if (!userData.badges.includes(badge.credential)) {
						bot.userInfo.push(message.author.key, badge.credential, "badges");
						await message.channel.send(`${bot.emojis.get(badge.emojiId)} - Care of Magical Creatures badge earned!`);
					}
				}
			}

			pet.lastFeed = moment.tz("America/Los_Angeles").format("l");

			userData.pets.splice(userData.pets.findIndex(p => p.id == pet.id), 1, pet);
			bot.userInfo.set(message.author.key, userData.pets, "pets");

			message.channel.send("You have fed your pet!");
		} else if (args[0] == "set-name") {
			if (!pet) {
				return message.channel.send("It seems you don't have a pet to name. You can purchase a pet at the **Magical Menagerie**");
			}

			if (!args[1]) {
				return message.channel.send("❌ | Please specify what to name your pet!");
			}

			args = message.content.split(/ +/);
			args.splice(0, 2);

			const name = args.join(" ");

			pet.nickname = name;
			userData.pets.splice(userData.pets.findIndex(p => p.id == pet.id), 1, pet);
			bot.userInfo.set(message.author.key, userData.pets, "pets");

			message.channel.send(`I have set your pets name to ${name}`);
		}
	},
};
