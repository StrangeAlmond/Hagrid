const Discord = require("discord.js");

module.exports = {
	name: "help",
	description: "View a list of Hagrid's commands.",
	aliases: ["h"],
	async execute(message, args, bot) {
		const embeds = [];

		function createCommandsEmbed(name, commands, page) {
			const embed = new Discord.RichEmbed()
				.setAuthor(name)
				.setDescription(`**Arguments within < > are required.\nArguments within [ ] are optional.**\n\n${commands}`)
				.setColor(message.member.displayHexColor)
				.setTimestamp();
			embeds.push(embed);
		}

		let commands = "";
		const statsCommands = "**!profile** - View your profile.\n**!stats** - View your stats.\n**!xp** - View your xp.\n**!inventory [item]** - View your inventory, alternatively search for a specific item.\n**!curriculum** - View Hogwarts' current curriculum\n**!houses** - View how many members are in each house.\n**!merits** - View your merits.\n**!badges profile** - View your badges.\n**!leaderboard [leaderboard type]** - View the leaderboard.";
		const mazeCommands = "**!start** - Create a maze channel for you to use the maze commands in.\n**!leave** - Delete your maze channel.\n**!move <left, right, up, or down>** - Move the direction specified in the maze.\n**!forage** - Forage for an item.\n**!explore** - Explore the maze for any items that may be lying around.";
		const moneyCommands = "**!daily** - Collect your daily sickles.\n**!weekly** - Collect your weekly galleons (requires cistem aperio).\n**!balance** - View your balance.\n**!shop [shop id]** - View a shop's items.\n**!buy <item id>** - Buy an item from the shop.";

		const funCommands = "**!divine** - Ask the crystal ball a question.\n!cards - View your collectors cards.\n!card <card name> View a collectors card more closely.\n!open <item> - Open an item.\n**!pensieve <reminder> <days:hours:minutes>** - Set a reminder.\n**!pensieve list** - List your reminders.\n**!joke** - Ask Peeves to tell you a joke.\n**!trivia** - Spawn a trivia question (these ones do not give house points).\n**!bean** - Eat a Bertie Botts bean.\n**!illegibilus** - Make text unreadable.";
		const petCommands = "**!pet** - View your pet\n**!pet feed** - Feed your pet.\n**!pet set-name <name>** - Set your pets nickname.";
		const potionCommands = "**!recipe [potion]** - View a potions recipe.\n**!brew <potion>** - Brew a potion.";

		const botCommandRoles = ["Headmaster", "Deputy Headmaster", "Heads of House", "Auror", "Support Staff"];

		if (message.member.roles.some(r => botCommandRoles.includes(r.name)) || message.author.id === "356172624684122113") commands += "**!ping** - ping the bot\n**!about** - about the bot\n**!uptime** - check the uptime of the bot\n";
		commands += "**!wiki** - View Hagrid's wiki.\n**!merit <@member>** - Merit a member.\n**!badges** - View the available badges.\n**!rule <rule number>** - View the information on a rule.\n**!schedule** - View the training schedule.\n**!duel <@member>** - Send a duel request to a member.\n**!use <item>** - Use an item.\n**!optout** - Opt out of notifications when you can train.\n**!optin** - Opt in to notification when you can train.";

		createCommandsEmbed("General Commands", commands);
		createCommandsEmbed("Statistics Commands", statsCommands);
		createCommandsEmbed("Maze Commands", mazeCommands);
		createCommandsEmbed("Economy/Money Commands", moneyCommands);
		createCommandsEmbed("Pet Commands", petCommands);
		createCommandsEmbed("Fun Commands", funCommands);
		createCommandsEmbed("Potion Commands", potionCommands);

		if (message.member.hasPermission("MANAGE_MESSAGES")) {
			const modCommands = "**!clear <amount>** - Clear up to 100 messages.\n**!silencio <@member> [time] [reason]** - Mute a member.\n**!sonorus <@member> [reason]** - Unmute a member.";
			createCommandsEmbed("Mod Commands", modCommands);
		}

		let page = 1;

		embeds.sort((a, b) => b.description.length - a.description.length);

		message.channel.send(embeds[0]).then(async msg => {
			await msg.react("◀");
			await msg.react("▶");

			const filter = (reaction, user) => ["▶", "◀"].includes(reaction.emoji.name) && user.id == message.author.id;
			const reactionCollector = msg.createReactionCollector(filter, {
				time: 120000
			});

			reactionCollector.on("collect", async collected => {
				if (collected.emoji.name === "▶") {
					if (page === embeds.length) return msg.reactions.last().remove(message.author);

					page++;

					await msg.edit(embeds[page - 1]);
					msg.reactions.last().remove(message.author);
				} else if (collected.emoji.name === "◀") {
					if (page === 1) return msg.reactions.first().remove(message.author);

					page--;

					// Edit the message with the new page
					await msg.edit(embeds[page - 1]);
					msg.reactions.first().remove(message.author);
				}
			});

			reactionCollector.on("end", async () => {
				await message.react("✅");
				msg.delete();
			});

		});

	},
};
