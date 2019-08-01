const Discord = require("discord.js");
const botconfig = require("../botconfig.json");
const nodeFetch = require("node-fetch");

module.exports = {
	name: "spell",
	description: "random spell",
	aliases: ["randomspell"],
	async execute(message, args, bot) {
		let body = await nodeFetch(`https://www.potterapi.com/v1/spells?key=${botconfig.potterAPIKey}`);
		body = await body.json();

		const spell = await body[Math.floor(Math.random() * (body.length - 0 + 1)) + 0];

		const spellEmbed = new Discord.RichEmbed()
			.setAuthor("Random Spell", message.author.displayAvatarURL)
			.setDescription(`**Name:** ${spell.spell}\n**Type:** ${spell.type}\n**Effect:** ${spell.effect}`)
			.setColor(message.member.displayHexColor)
			.setTimestamp();

		message.channel.send(spellEmbed);
	},
};
