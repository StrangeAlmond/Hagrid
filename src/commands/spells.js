const Discord = require("discord.js");
const spellsFile = require("../jsonFiles/spells.json");

module.exports = {
	name: "spells",
	description: "View your studied spells.",
	aliases: ["learnedspells"],
	async execute(message, args, bot) {
		const user = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]) || message.member;

		const learnedSpells = bot.userInfo.get(`${message.guild.id}-${user.id}`, "studiedSpells");
		const spells = learnedSpells
			.sort()
			.map(s => `**${bot.functions.capitalizeFirstLetter(s)}** (${spellsFile.find(spell => spell.spellName == s).name})`)
			.join("\n");

		const oneTimeSpells = ["herbology", "care of magical creatures"]; // These spells automatically reset when studied and can't be permanently learned.

		const spellsEmbed = new Discord.MessageEmbed()
			.setAuthor(`${user.displayName}'s Learned Spells/Potions`, user.user.displayAvatarURL())
			.setColor(user.displayHexColor)
			.setDescription(spells)
			.setFooter(`${learnedSpells.length}/${spellsFile.filter(s => !oneTimeSpells.includes(s.class.toLowerCase())).length} spells learned`)
			.setTimestamp();
		message.channel.send(spellsEmbed);
	},
};
