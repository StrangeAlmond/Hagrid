const Discord = require("discord.js");
const moment = require("moment-timezone");

module.exports = {
  name: "exams",
  description: "Take your OWL",
  aliases: ["owls"],
  async execute(message, args, bot) {
    if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "year") !== 5) return;

    const validWeeks = [12, 13, 25, 26, 38, 39, 51, 52];
    if (!validWeeks.includes(moment().tz("America/Los_Angeles").week())) return;

    const userData = bot.userInfo.get(`${message.guild.id}-${message.author.id}`);
    const amountOfSpellsLearned = userData.studiedSpells.length;

    message.channel.send("**__O.W.L.s__**\n\nO - Outstanding (25 spells/potions learned)\nE - Exceeds Expectations (23 spells/potions learned)\nA - Acceptable (21 spells/potions learned)\nFailing Grades P - Poor (15-20 spells/potions learned)\nD - Dreadful (6-14 spells/potions learned)\nT - Troll (0-5 spells/potions learned)\n\n**Are you sure you'd like to take your O.W.L Exams?**").then(async msg => {
      await msg.react("✅");
      await msg.react("❌");

      const reactionFilter = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id === message.author.id;
      const reactionCollector = msg.createReactionCollector(reactionFilter, {
        time: 60000
      });

      reactionCollector.on("collect", async () => {
        reactionCollector.stop();
        await msg.delete();

        let grade = "";
        const passingGrades = ["A - Acceptable", "E - Exceeds Expectations", "O - Outstanding"];

        if (amountOfSpellsLearned <= 5) {
          grade = "T - Troll";
        } else if (amountOfSpellsLearned <= 14) {
          grade = "D - Dreadful";
        } else if (amountOfSpellsLearned <= 20) {
          grade = "P - Poor";
        } else if (amountOfSpellsLearned <= 21) {
          grade = "A - Acceptable";
        } else if (amountOfSpellsLearned <= 23) {
          grade = "E - Exceeds Expectations";
        } else if (amountOfSpellsLearned <= 25) {
          grade = "O - Outstanding";
        }

        if (passingGrades.includes(grade)) {
          bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, "stats.owls");

          await message.channel.send("You have passed your O.W.Ls and have been promoted to year 6.");

          bot.emit("levelUp", message.member, message.channel);
        } else {
          bot.userInfo.set(`${message.guild.id}-${message.author.id}`, grade, "stats.owls");
          await message.channel.send("You have failed your O.W.Ls. Come back when you've actually studied.");
        }
      });
    });

  },
};
