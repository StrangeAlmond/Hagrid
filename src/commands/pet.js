const ms = require("parse-ms");
const Discord = require("discord.js");
const moment = require("moment-timezone");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "pet",
	description: "View your pet, Feed your pet, or change your pet's name",
	async execute(message, args, bot) {
		const user = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);

		if (!user.pet) return message.channel.send("You don't have a pet!");
		if (user.pet.fainted && args[0]) return message.channel.send("Your pet has fainted. You can revive your pet with **stinksap**.");

		const lastFeed = user.pet.lastFeed;
		const starveDate = moment.tz(new Date(lastFeed), "America/Los_Angeles");
		const lastFeedObj = ms(Date.now() - starveDate.valueOf());

		if (lastFeed && lastFeedObj.days >= 8) {
			const pet = user.pet;
			bot.userInfo.delete(`${message.guild.id}-${message.author.id}`, "pet");
			return message.channel.send(`Sorry ${message.author}, I'm gonna have to take yer ${pet.pet} away. Very disappointin' to see you neglect little ${pet.nickname} like that. When yer ready to care fer a pet again, you can go back to Diagon Alley and buy a new one.`);
		}

		if (lastFeed && lastFeedObj.days >= 3 && !user.pet.fainted) {
			message.channel.send("Your pet has fainted after days of neglect!");
			return bot.userInfo.set(`${message.guild.id}-${message.author.id}`, true, "pet.fainted");
		}

		if (!args[0]) {
			let petHappiness = "";
			const today = moment.tz("America/Los_Angeles").format("l");

			if (lastFeed && lastFeedObj.hours >= 24) {
				petHappiness = "Starving";
			} else if (lastFeed && lastFeed !== today) {
				petHappiness = "Hungry";
			} else if (lastFeed == null) {
				petHappiness = "Hungry";
			} else if (lastFeed && lastFeed === today) {
				petHappiness = "Full";
			}

			if (user.pet.fainted) petHappiness = "Fainted";

			const embed = new Discord.RichEmbed()
				.setAuthor(user.pet.nickname, message.author.displayAvatarURL)
				.setThumbnail("attachment://image.png")
				.setDescription(`**Pet XP:** ${user.pet.xp}\n**Pet Status:** ${petHappiness}\n**Level:** ${user.pet.level}\n**Gender:** ${user.pet.gender.charAt(0).toUpperCase() + user.pet.gender.slice(1)}`)
				.setColor(message.member.displayHexColor)
				.setTimestamp();

			message.channel.send({
				embed,
				files: [{
					attachment: `../images/pets/${bot.toCamelCase(user.pet.pet.toLowerCase())}.png`,
					name: "image.png"
				}]
			});
		} else if (args[0] === "feed") {
			const petYear = user.pet.level;
			let petXp = user.pet.xp;

			if (petXp >= 365) return message.channel.send("It seems your pet isn't hungry!");

			const msToMidnight = bot.timeUntilMidnight();
			if (lastFeed === moment.tz("America/Los_Angeles").format("l")) {
				const timeObj = ms(msToMidnight);
				return message.channel.send(`${message.member}, You can feed your pet again in ${timeObj.hours}h, ${timeObj.minutes}m, ${timeObj.seconds}s.`);
			}

			await bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "pet.xp");

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
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, petYear + 1, "pet.level");

				if ((petYear + 1) === 7) {
					const badge = badges.find(b => b.name.toLowerCase() === "care of magical creatures badge"); // Care of magical creatures badge

					if (!user.badges.includes(badge.credential)) {
						bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badge.credential, "badges");
						await message.channel.send(`${bot.emojis.get(badge.emojiId)} - Care of Magical Creatures badge earned!`);
					}
				}
			}

			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, moment.tz("America/Los_Angeles").format("l"), "pet.lastFeed");
			message.channel.send("You have fed your pet!");
		} else if (args[0] === "set-name") {
			if (!args[1]) return message.channel.send("❌ | Please specify what to name your pet!");

			args = message.content.split(/ +/);
			args.splice(0, 2);

			const name = args.join(" ");
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, name, "pet.nickname");
			message.channel.send(`I have set your pets name to ${name}`);
		}
	},
};
