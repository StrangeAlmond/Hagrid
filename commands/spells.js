const Discord = require("discord.js");
const spellsFile = require("../jsonFiles/spells.json");

module.exports = {
	name: "spells",
	description: "see your learned spells",
	aliases: ["learnedspells"],
	async execute(message, args, bot) {
		const user = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]) || message.member;

		const learnedSpells = await bot.userInfo.get(`${message.guild.id}-${user.id}`, "studiedSpells");
		const spells = learnedSpells.sort().map(s => `**${s.charAt(0).toUpperCase() + s.slice(1)}** (${spellsFile.find(spell => spell.spellName === s).name})`).join("\n");

		const spellsEmbed = new Discord.RichEmbed()
			.setAuthor(`${user.displayName}'s Learned Spells/Potions`, user.user.displayAvatarURL)
			.setColor(user.displayHexColor)
			.setDescription(spells)
			.setFooter(`${learnedSpells.length}/${spellsFile.filter(s => !["herbology", "care of magical creatures"].includes(s.class.toLowerCase())).length} spells learned`)
			.setTimestamp();
		message.channel.send(spellsEmbed);
	},
};
