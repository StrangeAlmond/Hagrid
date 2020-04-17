const Discord = require("discord.js");
const recipes = require("../jsonFiles/potions.json");

module.exports = {
	name: "recipe",
	description: "View the recipe of a potion.",
	async execute(message, args, bot) {
		const webhookOptions = {
			username: "Severus Snape",
			avatar: "../images/webhook_avatars/severusSnape.jpg"
		};

		const userData = bot.userInfo.get(message.author.key);

		if (!args[0]) {
			const embeds = [];

			for (const potion of recipes) {
				const ingredients = potion.ingredients;
				const formattedIngredients = ingredients
					.map(i => `${formatString(i)} ${userData.inventory[i.split(/ +/)[1]] >= parseInt(i.split(/ +/)[0]) ? "✅" : "❌"}`)
					.sort()
					.join("\n");

				const embed = new Discord.MessageEmbed()
					.setTitle(`${formatString(potion.potion)} Recipe`)
					.setDescription(`To brew a ${formatString(potion.potion)}, you need:\n${formattedIngredients}\n\n${!userData.studiedSpells.includes(formatString(potion.potion).toLowerCase()) ? "***Note: You have not studied this potion.***" : ""}`)
					.setColor(message.member.displayHexColor)
					.setTimestamp();

				embeds.push(embed);
			}

			const msg = await message.channel.send(embeds[0]);

			if (embeds.length == 1) return;

			let page = 1;

			await msg.react("◀");
			await msg.react("▶");

			const filter = (reaction, user) => ["◀", "▶"].includes(reaction.emoji.name) && user.id == message.author.id;
			const reactionCollector = msg.createReactionCollector(filter, {
				time: 120000
			});

			reactionCollector.on("collect", async collected => {
				if (collected.emoji.name == "◀") {
					if (page == 1) return msg.reactions.cache.first().users.remove(message.author);
					page--;

					await msg.edit(embeds[page - 1]);
					msg.reactions.cache.first().users.remove(message.author);
				} else if (collected.emoji.name == "▶") {
					if (page == embeds.length) return msg.reactions.cache.last().users.remove(message.author);
					page++;

					await msg.edit(embeds[page - 1]);
					msg.reactions.cache.last().users.remove(message.author);
				}
			});

			return;
		}

		const potion = recipes.find(r => formatString(r.potion).toLowerCase().includes(args.join(" ")));
		if (!potion) return errorMessage("Invalid Potion.");

		const ingredients = potion.ingredients;
		const formattedIngredients = ingredients
			.map(i => `${formatString(i)} ${userData.inventory[i.split(/ +/)[1]] >= parseInt(i.split(/ +/)[0]) ? "✅" : "❌"}`)
			.sort()
			.join("\n");

		const recipeEmbed = new Discord.MessageEmbed()
			.setTitle(`${formatString(potion.potion)} Recipe`)
			.setDescription(`To brew a ${formatString(potion.potion)}, you need:\n${formattedIngredients}\n\n${!userData.studiedSpells.includes(formatString(potion.potion).toLowerCase()) ? "***Note: You have not studied this potion.***" : ""}`)
			.setColor(message.member.displayHexColor)
			.setTimestamp();

		bot.functions.quickWebhook(message.channel, recipeEmbed, webhookOptions);

		function formatString(string) {
			const formatted = string.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
			const capitalized = formatted.replace(/\w\S*/g, str => str.charAt(0).toUpperCase() + str.substr(1).toLowerCase());
			return capitalized;
		}

		function errorMessage(msg) {
			return bot.quickWebhook(message.channel, msg, webhookOptions);
		}
	},
};
