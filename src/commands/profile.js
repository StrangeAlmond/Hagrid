const Discord = require("discord.js");
const numeral = require("numeral");
const yearsFile = require("../jsonFiles/years.json");
const badgesArray = require("../jsonFiles/badges.json");

module.exports = {
	name: "profile",
	description: "View your profile.",
	aliases: ["p"],
	async execute(message, args, bot) {
		const user = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]) || message.member;
		const userData = bot.userInfo.get(`${message.guild.id}-${user.id}`);

		let xpToLevelUp = userData.year < 7 ? yearsFile[userData.year + 1].xp - userData.xp : 0;
		if (xpToLevelUp < 0) xpToLevelUp = 0;

		const badges = userData.badges.map(b => {
			const badge = badgesArray.find(i => i.credential == b);
			return `${bot.emojis.cache.get(badge.emojiID) || ""} - ${badge.name}`;
		}).join("\n");

		const activeEffects = userData.stats.activeEffects.length > 0 ?
			userData.stats.activeEffects.map(e => e.type.charAt(0).toUpperCase() + e.type.slice(1)).join(", ") : "N/A";

		if (userData.stats.health < 0) userData.stats.health = 0;

		const thumbnail = findThumbnail();

		const profile = `
		**Year:** ${userData.year}
		**XP:** ${numeral(userData.xp).format("0,0")}
		**Lifetime XP:** ${numeral(userData.stats.lifetimeXp).format("0,0")}
		**XP to next year:** ${numeral(xpToLevelUp).format("0,0")}

		**O.W.L Grade:** ${userData.stats.owls ? userData.stats.owls : "Unknown"}
		**House Points:** ${userData.stats.housePoints}
		**Merits:** ${userData.stats.merits}
		**Cauldron:** ${userData.cauldron.charAt(0).toUpperCase() + userData.cauldron.slice(1)}

		**Attack:** ${userData.stats.attack}
		**Defense:** ${userData.stats.defense}
		**Health:** ${userData.stats.health}
		**Max Health**: ${userData.stats.maxHealth}
		
		**Active Effects:** ${activeEffects}
		
		${badges.length > 0 ? `**Badges:**\n ${badges}` : ""}

		${userData.stats.poisonedObject ? "***Note: You have been poisoned.***" : ""}
		${userData.stats.fainted ? "***Note: You have fainted.***" : ""}
		`;

		const profileEmbed = new Discord.MessageEmbed()
			.setAuthor(`${user.displayName}'s Profile`, user.user.displayAvatarURL())
			.setThumbnail(thumbnail)
			.setDescription(profile)
			.setColor(user.displayHexColor)
			.setFooter(`Use ${bot.prefix}stats to see your stats`)
			.setTimestamp();
		message.channel.send(profileEmbed);

		function findThumbnail() {
			if (user.id == "137269251361865728") return "https://cdn.discordapp.com/attachments/518865376918896663/521029959003668501/Hogwarts_Crest_Wall_Plaque002.png";

			if (user.roles.cache.find(r => r.name.toLowerCase() == "servor auror")) return "https://i.imgur.com/WK95bWB.png";

			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads of house") && user.roles.cache.find(r => r.name.toLowerCase() == "slytherin")) return "https://i.imgur.com/5rqHISJ.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads of house") && user.roles.cache.find(r => r.name.toLowerCase() == "gryffindor")) return "https://i.imgur.com/nGD0usI.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads of house") && user.roles.cache.find(r => r.name.toLowerCase() == "hufflepuff")) return "https://i.imgur.com/Wcm42XI.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads of house") && user.roles.cache.find(r => r.name.toLowerCase() == "ravenclaw")) return "https://i.imgur.com/1kBX2yh.png";

			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads boy") && user.roles.cache.find(r => r.name.toLowerCase() == "slytherin")) return "https://i.imgur.com/hFvsVst.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads boy") && user.roles.cache.find(r => r.name.toLowerCase() == "gryffindor")) return "https://i.imgur.com/OX6NthT.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads boy") && user.roles.cache.find(r => r.name.toLowerCase() == "hufflepuff")) return "https://i.imgur.com/Lzq2NXi.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads boy") && user.roles.cache.find(r => r.name.toLowerCase() == "ravenclaw")) return "https://i.imgur.com/9PwBFJk.png";

			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads girl") && user.roles.cache.find(r => r.name.toLowerCase() == "slytherin")) return "https://i.imgur.com/Gvi4WM8.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads girl") && user.roles.cache.find(r => r.name.toLowerCase() == "gryffindor")) return "https://i.imgur.com/SCZnQf7.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads girl") && user.roles.cache.find(r => r.name.toLowerCase() == "hufflepuff")) return "https://i.imgur.com/Zsxz9Wa.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "heads girl") && user.roles.cache.find(r => r.name.toLowerCase() == "ravenclaw")) return "https://i.imgur.com/Adz5vDV.png";

			if (user.roles.cache.find(r => r.name.toLowerCase() == "prefect") && user.roles.cache.find(r => r.name.toLowerCase() == "slytherin")) return "https://i.imgur.com/3oz7Gfn.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "prefect") && user.roles.cache.find(r => r.name.toLowerCase() == "gryffindor")) return "https://i.imgur.com/PBuoGbT.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "prefect") && user.roles.cache.find(r => r.name.toLowerCase() == "hufflepuff")) return "https://i.imgur.com/j9hFSZx.png";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "prefect") && user.roles.cache.find(r => r.name.toLowerCase() == "ravenclaw")) return "https://i.imgur.com/KP2pFBT.png";

			if (user.roles.cache.find(r => r.name.toLowerCase() == "slytherin")) return "https://vignette.wikia.nocookie.net/harrypotter/images/0/00/Slytherin_ClearBG.png/revision/latest/scale-to-width-down/350?cb=20161020182557";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "gryffindor")) return "https://vignette.wikia.nocookie.net/harrypotter/images/b/b1/Gryffindor_ClearBG.png/revision/latest/scale-to-width-down/350?cb=20190222162949";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "hufflepuff")) return "https://vignette.wikia.nocookie.net/harrypotter/images/0/06/Hufflepuff_ClearBG.png/revision/latest/scale-to-width-down/350?cb=20161020182518";
			if (user.roles.cache.find(r => r.name.toLowerCase() == "ravenclaw")) return "https://vignette.wikia.nocookie.net/harrypotter/images/4/4e/RavenclawCrest.png/revision/latest/scale-to-width-down/350?cb=20161020182442";
		}

	},
};
