const Discord = require("discord.js");
const db = require("../utils/db.js");

module.exports = {
    name: "guild-stats",
    description: "View this guild's stats.",
    aliases: ["guildstats", "guild_stats", "gs"],
    async execute(message, args, bot) {
        const guildStats = db.guildInfo.get(message.guild.id, "stats");
        const statsEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.guild.name}'s Statistics`, message.guild.iconURL())
            .setDescription(`**Total Training Sessions:** ${guildStats.trainingSessions}\n**Total Spawns:** ${guildStats.spawns}\n**Total Trivia Questions:** ${guildStats.triviaQuestions}`)
            .setTimestamp();

        message.channel.send(statsEmbed);
    },
};
