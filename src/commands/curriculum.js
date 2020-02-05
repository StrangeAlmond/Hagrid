const Discord = require("discord.js");
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
	name: "curriculum",
	description: "View each year's curriculum",
	async execute(message, args, bot) {
		const classes = ["Care of Magical Creatures", "Charms", "Defense Against the Dark Arts", "Divination", "Herbology", "Potions", "Transfiguration"];
		const pages = [];

		for (let i = 1; i < 7; i++) {
			const yearSpells = spells.filter(s => s.yearRequired == i);

			let msg = "";

			for (let j = 0; j < classes.length; j++) {
				const curClass = classes[j];
				if (yearSpells.some(s => s.class.toLowerCase() == curClass.toLowerCase())) {

					let classSpells = yearSpells.filter(s => s.class.toLowerCase() == curClass.toLowerCase());

					if (["herbology", "care of magical creatures"].includes(curClass.toLowerCase())) {
						classSpells = classSpells.map(s => `${s.name} - ${bot.capitalizeEveryFirstLetter(bot.fromCamelCase(s.reward))}`);
					} else if (["potions"].includes(curClass.toLowerCase())) {
						classSpells = classSpells.map(s => `${s.name}`);
					} else {
						classSpells = classSpells.map(s => `${s.name} - ${bot.prefix}${s.spellName}`);
					}

					classSpells = classSpells.join("\n");

					msg += `**__${curClass}__**\n${classSpells}\n\n`;
				}
			}

			const embed = new Discord.RichEmbed()
				.setTitle(`Year ${i} Curriculum`)
				.setColor(message.member.displayHexColor)
				.setDescription(msg)
				.setTimestamp();

			pages.push(embed);
		}

		let page = 1;

		const msg = await message.channel.send(pages[0]);

		await msg.react("◀");
		await msg.react("▶");

		const filter = (reaction, user) => ["▶", "◀"].includes(reaction.emoji.name) && user.id == message.author.id;
		const reactionCollector = msg.createReactionCollector(filter, {
			time: 120000
		});

		reactionCollector.on("collect", async collected => {
			if (collected.emoji.name === "▶") {
				if (page === pages.length) return msg.reactions.last().remove(message.author);

				page++;

				await msg.edit(pages[page - 1]);
				msg.reactions.last().remove(message.author);
			} else if (collected.emoji.name === "◀") {
				if (page === 1) return msg.reactions.first().remove(message.author);

				page--;

				// Edit the message with the new page
				await msg.edit(pages[page - 1]);
				msg.reactions.first().remove(message.author);
			}
		});

		reactionCollector.on("end", async () => {
			pages[page - 1].setFooter("This reaction menu has expired.");
			msg.edit(pages[page - 1]);
		});
	},
};
