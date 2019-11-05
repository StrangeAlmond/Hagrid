const Discord = require("discord.js");
const badgesFile = require("../jsonFiles/badges.json");

let authorMessageCollector;
let toDuelMessageCollector;
let authorMessage;
let toDuelMessage;

module.exports = {
	name: "duel",
	description: "Duel another player",
	aliases: ["battle"],
	async execute(message, args, bot) {
		// Grab the user they mentioned
		const toDuel = bot.getUserFromMention(args[0], message.guild) || message.guild.members.get(args[0]);

		// Verify that they tagged someone to duel, that person isn't themselves, that person isn't hagrid, and that person isn't a bot
		if (!toDuel) return message.channel.send("I couldn't find that user!").then(msg => msg.delete(10000));
		if (toDuel.id === message.author.id) return message.channel.send("You can't battle yourself!").then(msg => msg.delete(10000));
		if (toDuel.id === bot.user.id) return message.channel.send("My fighting days are long gone.").then(msg => msg.delete(10000));
		if (toDuel.user.bot) return;

		bot.ensureUser(toDuel);

		// Tell the challenged user they have been challenged to a duel
		message.channel.send(`${toDuel}, ${message.author} has challenged you to a duel, do you wish to accept?`).then(async msg => {
			// React with No/Yes reactions.
			await msg.react("✅");
			await msg.react("❌");

			// Create a reaction collector for their response
			const filter = (reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === toDuel.id;
			const responseReactionCollector = msg.createReactionCollector(filter, {
				time: 60000
			});

			// Remove the emojis and say the challenge has expired if they don't accept in time
			const clearing = setTimeout(() => {
				msg.clearReactions();
				msg.edit("This challenge has expired");
			}, 60000);

			responseReactionCollector.on("collect", collected => {
				responseReactionCollector.stop();

				if (collected.emoji.name === "✅") {
					msg.delete();
					startDuel();
				} else if (collected.emoji.name === "❌") {
					message.channel.send(`${message.author}, ${toDuel} has declined your challenge.`);
					msg.delete();
				}

				responseReactionCollector.stop();
				clearTimeout(clearing);

			});
		}); // Duel accept/decline reaction collector

		async function startDuel(msg) {
			let authorDodgeChance = 0;
			let toDuelDodgeChance = 0;

			const authorNumber = bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "year");
			const toDuelNumber = bot.userInfo.get(`${message.guild.id}-${toDuel.id}`, "year");

			let authorDodged = false;
			let toDuelDodged = false;

			if (authorNumber > toDuelNumber) {
				authorDodgeChance = (authorNumber - toDuelNumber) * 10;
				toDuelDodgeChance = 0;
			}
			if (toDuelNumber > authorNumber) {
				toDuelDodgeChance = (toDuelNumber - authorNumber) * 10;
				authorDodgeChance = 0;
			}

			if (message.author.id === "137269251361865728") {
				authorDodgeChance = 90;
			} else if (toDuel.id === "137269251361865728") {
				toDuelDodgeChance = 90;
			}

			// Their chosen move
			let authorChosenMove = "";
			let toDuelChosenMove = "";

			// If they've picked a move or not
			let authorStatus = false;
			let toDuelStatus = false;

			// Their point
			let authorPoints = 0;
			let toDuelPoints = 0;

			// Round win message and winner
			let winStatus = "";
			let winner = undefined;

			// Current round
			let curRound = 0;

			// Round messages
			const authorWinsRoundMessage = `${message.member.displayName} wins this round.`;
			const toDuelWinsRoundMessage = `${toDuel.displayName} wins this round.`;
			const tieMessage = "It's a tie";

			// Scoreboard embed
			const scoreBoard = new Discord.RichEmbed()
				.setAuthor("Scoreboard")
				.setTimestamp();

			// Array for messages sent to delete after 5 minutes if the duel isn't in the dueling club
			const messages = [];

			// Duel has begun
			message.channel.send(`${toDuel}, ${message.author}, the duel has begun, please check your DMs for instructions`);

			// Send the scoreboard to the channel
			message.channel.send(scoreBoard).then(async scoreMsg => {
				// Add the scoreboard to the messages array
				messages.push(scoreMsg, message);

				// Create an author embed and a toDuel embed
				const authorEmbed = new Discord.RichEmbed()
					.setAuthor("Pick a move", message.author.displayAvatarURL)
					.setColor(message.member.displayHexColor)
					.setDescription("1. Aggressive\n2. Sneaky\n3. Defensive")
					.setTimestamp();

				const toDuelEmbed = new Discord.RichEmbed()
					.setAuthor("Pick a move", toDuel.user.displayAvatarURL)
					.setColor(toDuel.displayHexColor)
					.setDescription("1. Aggressive\n2. Sneaky\n3. Defensive")
					.setTimestamp();

				// DM the author
				await message.author.send(authorEmbed)
					.catch(error => { // Make sure Hagrid can DM the user
						return message.channel.send(`I am unable to DM ${message.member}, Please change your DM settings to allow DMs from members of this server`);
					})

					.then(async collected => {
						// The message the author replied with
						authorMessage = collected;

						// The filter for the message collector
						const filter = m => m.content.includes("1") || m.content.includes("2") || m.content.includes("3");
						// Create a message collector
						authorMessageCollector = new Discord.MessageCollector(authorMessage.channel, filter, {
							time: 300000
						});

						// Wait for an answer from the author
						authorMessageCollector.on("collect", async authorChoice => {
							// Set their move chosen based on their response
							if (authorChoice.content === "1") authorChosenMove = "Aggressive";
							if (authorChoice.content === "2") authorChosenMove = "Sneaky";
							if (authorChoice.content === "3") authorChosenMove = "Defensive";

							// Set their status to true
							authorStatus = true;

							// If toDuel has already replied
							if (toDuelStatus) {
								// Generate a random chance
								const chance = Math.random() * (100 - 0 + 1) + 0;

								// If the chance is under or equal to the author dodge chance then the author has dodged
								if (chance <= authorDodgeChance) authorDodged = true;
								// If the chance is under or equal to the toDuel dodge chance then toDuel has dodged
								if (chance <= toDuelDodgeChance) toDuelDodged = true;

								// Get the winner of the round
								winner = roundResults(message.author, toDuel, authorChosenMove, toDuelChosenMove);

								// If there is no winner
								if (!winner) {
									winStatus = tieMessage;
								} else if (winner.id === message.author.id) { // If the author won
									if (toDuelDodged) { // If toDuel dodged
										winStatus = `${toDuel.displayName} Dodged the attack.\nIt's a tie`;
										toDuelDodged = false;
									} else { // Otherwise the author won
										winStatus = authorWinsRoundMessage;
										authorPoints++;
										winner = undefined;
									}
								} else if (winner.id === toDuel.id) { // if toDuel won
									if (authorDodged) { // If the author dodged
										winStatus = `${message.member.displayName} Dodged the attack.\nIt's a tie`;
										authorDodged = false;
									} else { // Otherwise toDuel won
										winStatus = toDuelWinsRoundMessage;
										toDuelPoints++;
										winner = undefined;
									}
								}

								// Increase the current round by 1
								curRound++;

								// If the author has won
								if (authorPoints === 3) {
									// Edit the scoreboard to display that
									scoreBoard.addField("Final Results", `${message.member.displayName} wins this duel!\n${message.member} got 5 xp!\n${toDuel} got 3 xp!\n\n**Score:**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
									scoreMsg.edit(scoreBoard);

									// If they weren't fighting in the dueling channel then delete the messages after 5 minutes
									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									// Execute the win function
									return win(message.member, toDuel, authorPoints, toDuelPoints);
								}

								// If toDuel wins, repeat the same above but for toDuel
								if (toDuelPoints === 3) {
									scoreBoard.addField("Final Results", `${toDuel.displayName} wins this duel!\n${toDuel} got 5 xp!\n${message.member} got 3 xp!\n\n**Score:**\n${toDuel.displayName}: ${toDuelPoints}\n${message.member.displayName}: ${authorPoints}`, true);
									scoreMsg.edit(scoreBoard);

									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									return win(toDuel, message.member, toDuelPoints, authorPoints);
								}

								// Round Results
								scoreBoard.addField(`Round ${curRound}`, `${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
								authorEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);
								toDuelEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);

								scoreMsg.edit(scoreBoard);
								message.author.send(authorEmbed);
								toDuel.user.send(toDuelEmbed);

								// Set both players statuses to false
								authorStatus = false;
								toDuelStatus = false;
							} else {
								// Otherwise of toDuel hasn't chosen a move yet wait until they do.
								authorEmbed.setDescription(`You chose ${authorChosenMove}\nWaiting for ${toDuel.displayName}`);
								message.author.send(authorEmbed);
							}
						});
					});

				// Send a DM to toDuel
				toDuel.user.send(toDuelEmbed)
					.catch(error => { // Make sure we can send a DM to toDuel
						return message.channel.send(`I am unable to DM ${message.member}, Please change your DM settings to allow DMs from members of this server`);
					})

					.then(async collected => {
						// Get the message they replied withs
						toDuelMessage = collected;

						// Filter for the message collector
						const filter = m => m.content.includes("1") || m.content.includes("2") || m.content.includes("3");
						// Make a message collector
						toDuelMessageCollector = new Discord.MessageCollector(toDuelMessage.channel, filter, {
							time: 300000
						});

						// When they reply
						toDuelMessageCollector.on("collect", async toDuelChoice => {
							// Determine their chosen move based on their response
							if (toDuelChoice.content === "1") toDuelChosenMove = "Aggressive";
							if (toDuelChoice.content === "2") toDuelChosenMove = "Sneaky";
							if (toDuelChoice.content === "3") toDuelChosenMove = "Defensive";

							// Set their status to true
							toDuelStatus = true;

							// If the author has already replied
							if (authorStatus) {
								// Generate a random chance
								const chance = Math.random() * (100 - 0 + 1) + 0;

								// If the author or toDuel has dodged then set their dodged variable to true
								if (chance <= authorDodgeChance) authorDodged = true;
								if (chance <= toDuelDodgeChance) toDuelDodged = true;

								// Execute the roundResults function
								winner = roundResults(message.author, toDuel, authorChosenMove, toDuelChosenMove);

								// If there is no winner, then it's a tie
								if (!winner) {
									// Set the winStatus to the tie message
									winStatus = tieMessage;
								} else if (winner.id === message.author.id) { // If the author won
									if (toDuelDodged) { // If toDuel dodged
										winStatus = `${toDuel.displayName} Dodged the attack.\nIt's a tie`;
										toDuelDodged = false;
									} else { // author wins round
										winStatus = authorWinsRoundMessage;
										authorPoints++;
										winner = undefined;
									}
								} else if (winner.id === toDuel.id) { // If toDuel wins
									if (authorDodged) { // If the author dodged
										winStatus = `${message.member.displayName} Dodged the attack.\nIt's a tie`;
										authorDodged = false;
									} else { // toDuel wins
										winStatus = toDuelWinsRoundMessage;
										toDuelPoints++;
										winner = undefined;
									}
								}

								// Increment current round by 1
								curRound++;

								// If the author has won the duel
								if (authorPoints === 3) {
									// Reflect that on the scoreboard
									scoreBoard.addField("Final Results", `${message.member.displayName} wins this duel!\n${message.member} got 5 xp!\n${toDuel} got 3 xp!\n\n**Score:**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
									scoreMsg.edit(scoreBoard);

									// If they didn't duel in the proper channel then delete the messages after 5 minutes
									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									// Execute win function
									return win(message.member, toDuel, authorPoints, toDuelPoints);
								}

								// If toDuel won the duel
								if (toDuelPoints === 3) {
									// Reflect that on the scoreboard
									scoreBoard.addField("Final Results", `${toDuel.displayName} wins this duel!\n${toDuel} got 5 xp!\n${message.member} got 3 xp!\n\n**Score:**\n${toDuel.displayName}: ${toDuelPoints}\n${message.member.displayName}: ${authorPoints}`, true);
									scoreMsg.edit(scoreBoard);

									// If they didn't duel in the proper channel then delete the messages after 5 minutes
									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									// Execute the win function
									return win(toDuel, message.member, toDuelPoints, authorPoints);
								}

								// Round Results
								scoreBoard.addField(`Round ${curRound}`, `${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
								authorEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);
								toDuelEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);

								scoreMsg.edit(scoreBoard);
								message.author.send(authorEmbed);
								toDuel.user.send(toDuelEmbed);

								// Set the two players statuses to false
								authorStatus = false;
								toDuelStatus = false;
							} else {
								// Otherwise if the author hasn't replied yet wait for them to reply
								toDuelEmbed.setDescription(`You chose ${toDuelChosenMove}\nWaiting for ${message.member.displayName}`);
								toDuel.user.send(toDuelEmbed);
							}
						}); // toDuelReactionCollector .on("collect")
					}); // toDuelMessage .then

				// If the author's message collector expires then the duel also expires due to inactivity
				authorMessageCollector.on("end", () => {
					if (authorPoints >= 3 || toDuelPoints >= 3) return; // If either of them have already won then just don't do anything
					message.channel.send("The duel has expired due to inactivity");
				}); // Author reaction collector ends

			}); // Score board message .then
		} // End of duel function

		// Give a user a badge
		async function addBadge(user, badge) {
			badge = badgesFile.find(b => b.name.toLowerCase() === badge).credential;

			if (bot.userInfo.get(`${message.guild.id}-${user.id}`, "badges").includes(badge)) return;

			bot.userInfo.push(`${message.guild.id}-${user.id}`, badge, "badges");
			message.channel.send(`Congratulations ${user}, You've been awarded the ${badgesFile.find(b => b.credential === badge).name}`);
		}

		// Determine who won the round
		function roundResults(user1, user2, choice1, choice2) {
			choice1 = choice1.toLowerCase();
			choice2 = choice2.toLowerCase();

			const winObject = {
				"aggressive": {
					"aggressive": 0,
					"defensive": -1,
					"sneaky": 1
				},
				"defensive": {
					"aggressive": 1,
					"defensive": 0,
					"sneaky": -1
				},
				"sneaky": {
					"aggressive": -1,
					"defensive": 1,
					"sneaky": 0
				}
			};

			if (winObject[choice1][choice2] === 1) {
				return user1;
			} else if (winObject[choice1][choice2] === -1) {
				return user2;
			} else {
				return undefined;
			}
		}

		// Do several things to both the winner and the loser
		function win(duelWinner, duelLoser, winnerPoints, loserPoints) {
			const winEmbed = new Discord.RichEmbed()
				.setAuthor("Round Results", duelWinner.displayAvatarURL)
				.setDescription(`**Results:**\n${duelWinner.displayName} wins this duel!\n\n**Score:**\n${duelWinner.displayName}: ${winnerPoints}\n${duelLoser.displayName}: ${loserPoints}`)
				.setColor(duelWinner.displayHexColor)
				.setTimestamp();

			duelWinner.send(winEmbed);
			duelLoser.send(winEmbed);

			authorMessageCollector.stop();
			toDuelMessageCollector.stop();

			bot.userInfo.inc(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon");
			bot.userInfo.inc(`${message.guild.id}-${duelLoser.id}`, "stats.duelsLost");

			bot.userInfo.math(`${message.guild.id}-${duelWinner.id}`, "+", 5, "xp");

			bot.userInfo.math(`${message.guild.id}-${duelLoser.id}`, "+", 3, "xp");
			bot.userInfo.math(`${message.guild.id}-${duelLoser.id}`, "+", 3, "stats.lifetimeXp");

			if (loserPoints <= 0 && !bot.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "badges").includes(badgesFile.find(b => b.name.toLowerCase() === "reflex badge").credential)) {
				addBadge(duelWinner, "reflex badge");
			}

			if (bot.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon") === 50) {
				addBadge(duelWinner, "dueling veteran bronze badge");
			}

			if (bot.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon") === 200) {
				addBadge(duelWinner, "dueling veteran silver badge");
			}

			if (bot.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon") === 500) {
				addBadge(duelWinner, "dueling veteran gold badge");
			}
		}
	},
};
