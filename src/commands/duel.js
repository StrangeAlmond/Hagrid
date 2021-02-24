const Discord = require("discord.js");
const db = require("../utils/db.js");
const badgesFile = require("../jsonFiles/badges.json");

let authorMessageCollector;
let toDuelMessageCollector;
let authorMessage;
let toDuelMessage;

module.exports = {
	name: "duel",
	description: "Challenge a fellow wizard to a duel.",
	aliases: ["battle"],
	async execute(message, args, bot) {
		if (!args[0]) return message.channel.send("You must specify who you would like to duel.");
		const toDuel = bot.functions.getUserFromMention(args[0], message.guild) || message.guild.members.cache.get(args[0]);

		if (!toDuel) {
			return message.channel.send("I couldn't find that user!").then(msg => msg.delete({ timeout: 10000 }));
		}

		if (toDuel.id == message.author.id) {
			return message.channel.send("You can't battle yourself!").then(msg => msg.delete({ timeout: 10000 }));
		}

		if (toDuel.id == bot.user.id) {
			return message.channel.send("My fighting days are long gone.").then(msg => msg.delete({ timeout: 10000 }));
		}

		if (toDuel.user.bot) return;

		bot.functions.ensureUser(toDuel);

		message.channel.send(`${toDuel}, ${message.author} has challenged you to a duel, do you wish to accept?`)
			.then(async msg => {
				["✅", "❌"].forEach(await msg.react);

				const filter = (reaction, user) => ["✅", "❌"]
					.includes(reaction.emoji.name) && user.id == toDuel.id;

				const responseReactionCollector = msg.createReactionCollector(filter, {
					time: 300000
				});

				const clearing = setTimeout(() => {
					msg.reactions.removeAll();
					msg.edit("This challenge has expired");
				}, 300000);

				responseReactionCollector.on("collect", collected => {
					clearTimeout(clearing);
					responseReactionCollector.stop();

					if (collected.emoji.name == "✅") startDuel();
					else if (collected.emoji.name == "❌") message.channel.send(`${message.author}, ${toDuel} has declined your challenge.`);
					msg.delete();
				});
			});

		async function startDuel() {
			const authorYear = db.userInfo.get(message.author.key, "year");
			const toDuelYear = db.userInfo.get(`${message.guild.id}-${toDuel.id}`, "year");

			let authorDodgeChance = authorYear > toDuelYear ? (authorYear - toDuelYear) * 10 : 0;
			let toDuelDodgeChance = toDuelYear > authorYear ? (toDuelYear - authorYear) * 10 : 0;
			let authorDodged, toDuelDodged = false;

			if (db.userInfo.get(message.author.key, "stats.activeEffects").some(e => e.type == "luck")) {
				authorDodgeChance = 100;
			}

			if (db.userInfo.get(`${message.guild.id}-${toDuel.id}`, "stats.activeEffects").some(e => e.type == "luck")) {
				toDuelDodgeChance = 100;
			}

			// Make it impossible for the headmaster to lose
			if (message.member.roles.cache.some(r => r.name.toLowerCase() == "headmaster")) authorDodgeChance = 100;
			else if (toDuel.roles.cache.some(r => r.name.toLowerCase() == "headmaster")) toDuelDodgeChance = 100;

			let authorChosenMove, toDuelChosenMove = ""; // Their chosen move
			let authorStatus, toDuelStatus = false; // If they've picked a move or not
			let authorPoints, toDuelPoints = 0;

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
			const scoreBoard = new Discord.MessageEmbed()
				.setAuthor("Scoreboard")
				.setTimestamp();

			// Array for messages sent to which is used to delete them after 5 minutes if the duel isn't in #duelling-club
			const messages = [];

			message.channel.send(`${toDuel}, ${message.author}, the duel has begun, please check your DMs for instructions`);

			message.channel.send(scoreBoard).then(async scoreMsg => {
				messages.push(scoreMsg, message);

				const authorEmbed = new Discord.MessageEmbed()
					.setAuthor("Pick a move", message.author.displayAvatarURL)
					.setColor(message.member.displayHexColor)
					.setDescription("1. Aggressive\n2. Sneaky\n3. Defensive")
					.setTimestamp();

				const toDuelEmbed = new Discord.MessageEmbed()
					.setAuthor("Pick a move", toDuel.user.displayAvatarURL)
					.setColor(toDuel.displayHexColor)
					.setDescription("1. Aggressive\n2. Sneaky\n3. Defensive")
					.setTimestamp();

				await message.author.send(authorEmbed)
					.then(async collected => {
						authorMessage = collected;

						// The filter for the message collector
						const filter = m => ["1", "2", "3"].includes(m.content);
						// Create a message collector
						authorMessageCollector = new Discord.MessageCollector(authorMessage.channel, filter, {
							time: 300000
						});

						// Wait for an answer from the author
						authorMessageCollector.on("collect", async authorChoice => {
							if (authorChoice.content == "1") authorChosenMove = "Aggressive";
							if (authorChoice.content == "2") authorChosenMove = "Sneaky";
							if (authorChoice.content == "3") authorChosenMove = "Defensive";

							authorStatus = true;

							// If toDuel has already chosen their move
							if (toDuelStatus) {
								const chance = Math.random() * (100);

								if (chance <= authorDodgeChance) authorDodged = true;
								if (chance <= toDuelDodgeChance) toDuelDodged = true;

								winner = roundResults(message.author, toDuel, authorChosenMove, toDuelChosenMove);

								if (!winner) {
									winStatus = tieMessage;
								} else if (winner.id == message.author.id) {
									if (toDuelDodged) {
										winStatus = `${toDuel.displayName} Dodged the attack.\nIt's a tie`;
										toDuelDodged = false;
									} else {
										winStatus = authorWinsRoundMessage;
										authorPoints++;
										winner = undefined;
									}
								} else if (winner.id == toDuel.id) {
									if (authorDodged) {
										winStatus = `${message.member.displayName} Dodged the attack.\nIt's a tie`;
										authorDodged = false;
									} else {
										winStatus = toDuelWinsRoundMessage;
										toDuelPoints++;
										winner = undefined;
									}
								}

								curRound++;

								if (authorPoints == 3) {
									scoreBoard.addField("Final Results",
										`${message.member.displayName} wins this duel!\n${message.member} got 5 xp!\n${toDuel} got 3 xp!\n\n**Score:**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
									scoreMsg.edit(scoreBoard);

									// If they weren't fighting in the dueling channel then delete the messages after 5 minutes
									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									return win(message.member, toDuel, authorPoints, toDuelPoints);
								}

								if (toDuelPoints == 3) {
									scoreBoard.addField("Final Results",
										`${toDuel.displayName} wins this duel!\n${toDuel} got 5 xp!\n${message.member} got 3 xp!\n\n**Score:**\n${toDuel.displayName}: ${toDuelPoints}\n${message.member.displayName}: ${authorPoints}`, true);
									scoreMsg.edit(scoreBoard);

									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									return win(toDuel, message.member, toDuelPoints, authorPoints);
								}

								scoreBoard.addField(`Round ${curRound}`, `${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
								authorEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);
								toDuelEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);

								scoreMsg.edit(scoreBoard);
								message.author.send(authorEmbed);
								toDuel.user.send(toDuelEmbed);

								authorStatus, toDuelStatus = false;
							} else {
								authorEmbed.setDescription(`You chose ${authorChosenMove}\nWaiting for ${toDuel.displayName}`);
								message.author.send(authorEmbed);
							}
						});
					})

					.catch(() => {
						return message.channel.send(`I am unable to DM ${message.member}, Please change your DM settings to allow DMs from members of this server`);
					});

				toDuel.user.send(toDuelEmbed)
					.then(async collected => {
						toDuelMessage = collected;

						const filter = m => m.content.includes("1") || m.content.includes("2") || m.content.includes("3");
						toDuelMessageCollector = new Discord.MessageCollector(toDuelMessage.channel, filter, {
							time: 300000
						});

						toDuelMessageCollector.on("collect", async toDuelChoice => {
							if (toDuelChoice.content == "1") toDuelChosenMove = "Aggressive";
							if (toDuelChoice.content == "2") toDuelChosenMove = "Sneaky";
							if (toDuelChoice.content == "3") toDuelChosenMove = "Defensive";

							toDuelStatus = true;

							// If the author has already chosen their move
							if (authorStatus) {
								const chance = Math.random() * (100 - 0 + 1) + 0;

								if (chance <= authorDodgeChance) authorDodged = true;
								if (chance <= toDuelDodgeChance) toDuelDodged = true;

								winner = roundResults(message.author, toDuel, authorChosenMove, toDuelChosenMove);

								if (!winner) {
									winStatus = tieMessage;
								} else if (winner.id == message.author.id) {
									if (toDuelDodged) {
										winStatus = `${toDuel.displayName} Dodged the attack.\nIt's a tie`;
										toDuelDodged = false;
									} else {
										winStatus = authorWinsRoundMessage;
										authorPoints++;
										winner = undefined;
									}
								} else if (winner.id == toDuel.id) {
									if (authorDodged) {
										winStatus = `${message.member.displayName} Dodged the attack.\nIt's a tie`;
										authorDodged = false;
									} else {
										winStatus = toDuelWinsRoundMessage;
										toDuelPoints++;
										winner = undefined;
									}
								}

								curRound++;

								if (authorPoints == 3) {
									scoreBoard.addField("Final Results",
										`${message.member.displayName} wins this duel!\n${message.member} got 5 xp!\n${toDuel} got 3 xp!\n\n**Score:**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
									scoreMsg.edit(scoreBoard);

									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									return win(message.member, toDuel, authorPoints, toDuelPoints);
								}

								if (toDuelPoints == 3) {
									scoreBoard.addField("Final Results",
										`${toDuel.displayName} wins this duel!\n${toDuel} got 5 xp!\n${message.member} got 3 xp!\n\n**Score:**\n${toDuel.displayName}: ${toDuelPoints}\n${message.member.displayName}: ${authorPoints}`, true);
									scoreMsg.edit(scoreBoard);

									if (!message.channel.name.includes("duelling")) {
										setTimeout(() => {
											message.channel.bulkDelete(messages, true);
										}, 300000);
									}

									return win(toDuel, message.member, toDuelPoints, authorPoints);
								}

								scoreBoard.addField(`Round ${curRound}`, `${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}`, true);
								authorEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);
								toDuelEmbed.setDescription(`Last Round:\n${message.member.displayName} chose ${authorChosenMove}\n${toDuel.displayName} chose ${toDuelChosenMove}\n${winStatus}\n\n**Current Scores**\n${message.member.displayName}: ${authorPoints}\n${toDuel.displayName}: ${toDuelPoints}\n\n1. Aggressive\n2. Sneaky\n3. Defensive`);

								scoreMsg.edit(scoreBoard);
								message.author.send(authorEmbed);
								toDuel.user.send(toDuelEmbed);

								authorStatus = false;
								toDuelStatus = false;
							} else {
								toDuelEmbed.setDescription(`You chose ${toDuelChosenMove}\nWaiting for ${message.member.displayName}`);
								toDuel.user.send(toDuelEmbed);
							}
						});
					})

					.catch(() => {
						return message.channel.send(`I am unable to DM ${message.member}, Please change your DM settings to allow DMs from members of this server`);
					});

				// If the author's message collector expires then the duel also expires due to inactivity
				authorMessageCollector.on("end", () => {
					if (authorPoints >= 3 || toDuelPoints >= 3) return; // If either of them have already won then just don't do anything
					message.channel.send("The duel has expired due to inactivity");
				}); // Author reaction collector ends

			});
		}

		async function giveBadge(user, badge) {
			badge = badgesFile.find(b => b.name.toLowerCase() == badge).credential;

			if (db.userInfo.get(`${message.guild.id}-${user.id}`, "badges").includes(badge)) return;

			db.userInfo.push(`${message.guild.id}-${user.id}`, badge, "badges");
			message.channel.send(`Congratulations ${user}, You've been awarded the ${badgesFile.find(b => b.credential == badge).name}`);
		}

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

			if (winObject[choice1][choice2] == 1) return user1;
			else if (winObject[choice1][choice2] == -1) return user2;
			else return;

		}

		function win(duelWinner, duelLoser, winnerPoints, loserPoints) {
			const winEmbed = new Discord.MessageEmbed()
				.setAuthor("Round Results", duelWinner.displayAvatarURL)
				.setDescription(`**Results:**\n${duelWinner.displayName} wins this duel!\n\n**Score:**\n${duelWinner.displayName}: ${winnerPoints}\n${duelLoser.displayName}: ${loserPoints}`)
				.setColor(duelWinner.displayHexColor)
				.setTimestamp();

			duelWinner.send(winEmbed);
			duelLoser.send(winEmbed);

			authorMessageCollector.stop();
			toDuelMessageCollector.stop();

			db.userInfo.inc(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon");
			db.userInfo.inc(`${message.guild.id}-${duelLoser.id}`, "stats.duelsLost");

			db.userInfo.math(`${message.guild.id}-${duelWinner.id}`, "+", 5, "xp");
			db.userInfo.math(`${message.guild.id}-${duelLoser.id}`, "+", 3, "xp");

			if (loserPoints <= 0 && !db.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "badges")
				.includes(badgesFile.find(b => b.name.toLowerCase() == "reflex badge").credential)) {
				giveBadge(duelWinner, "reflex badge");
			}

			if (db.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon") == 50) {
				giveBadge(duelWinner, "dueling veteran bronze badge");
			}

			if (db.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon") == 200) {
				giveBadge(duelWinner, "dueling veteran silver badge");
			}

			if (db.userInfo.get(`${message.guild.id}-${duelWinner.id}`, "stats.duelsWon") == 500) {
				giveBadge(duelWinner, "dueling veteran gold badge");
			}
		}
	},
};
