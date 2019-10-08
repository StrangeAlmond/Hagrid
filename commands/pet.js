const ms = require("parse-ms");
const Discord = require("discord.js");
const moment = require("moment-timezone");
const badges = require("../jsonFiles/badges.json");

module.exports = {
	name: "pet",
	description: "Display your pet",
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

			if (lastFeed && lastFeedObj.hours >= 24) {
				petHappiness = "Starving";
			} else if (lastFeed && lastFeed !== moment.tz("America/Los_Angeles").format("l")) {
				petHappiness = "Hungry";
			} else if (lastFeed == null) {
				petHappiness = "Hungry";
			} else if (lastFeed && lastFeed === moment.tz("America/Los_Angeles").format("l")) {
				petHappiness = "Full";
			}

			if (user.pet.fainted) petHappiness = "Fainted";

			const petEmbed = new Discord.RichEmbed()
				.setAuthor(user.pet.nickname, message.author.displayAvatarURL)
				.setThumbnail(user.pet.image)
				.setDescription(`**Pet XP:** ${user.pet.xp}\n**Pet Status:** ${petHappiness}\n**Level:** ${user.pet.level}\n**Gender:** ${user.pet.gender.charAt(0).toUpperCase() + user.pet.gender.slice(1)}`)
				.setColor(message.member.displayHexColor)
				.setTimestamp();
			message.channel.send(petEmbed);
		} else if (args[0] === "feed") {
			const petYear = user.pet.level;
			const petXp = user.pet.xp;

			const msToMidnight = bot.timeUntilMidnight();

			if (lastFeed === moment.tz("America/Los_Angeles").format("l")) {
				const timeObj = ms(msToMidnight);
				return message.channel.send(`${message.member}, You can feed your pet again in ${timeObj.hours}h, ${timeObj.minutes}m, ${timeObj.seconds}s.`);
			}

			await bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "pet.xp");

			if (petYear === 1 && petXp >= 7) {
				message.channel.send("Your pet is now level 2!");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 2, "pet.level");
			} else if (petYear === 2 && petXp >= 14) {
				message.channel.send("Your pet is now level 3!");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 3, "pet.level");
			} else if (petYear === 3 && petXp >= 28) {
				message.channel.send("Your pet is now level 4!");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 4, "pet.level");
			} else if (petYear === 4 && petXp >= 52) {
				message.channel.send("Your pet is now level 5!");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 5, "pet.level");
			} else if (petYear === 5 && petXp >= 90) {
				message.channel.send("Your pet is now level 6!");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 6, "pet.level");
			} else if (petYear === 6 && petXp >= 180) {
				message.channel.send("Your pet is now level 7!");
				bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 7, "pet.level");

				if (!user.badges.includes(badges.find(b => b.name.toLowerCase() === "care of magical creatures badge").credential)) {
					bot.userInfo.push(`${message.guild.id}-${message.author.id}`, badges.find(b => b.name.toLowerCase() === "care of magical creatures badge").credential, "badges");
					message.channel.send(`${bot.emojis.get(badges.find(b => b.name.toLowerCase() === "care of magical creatures badge").emojiID)} - Care of Magical Creatures badge earned!`);
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
