const Discord = require("discord.js");
const db = require("../utils/db.js");
const moment = require("moment-timezone");

module.exports = {
    name: "guild-stats",
    description: "View this guild's stats.",
    aliases: ["guildstats", "guild_stats", "gs"],
    async execute(message, args, bot) {
        const guildStats = db.guildInfo.get(message.guild.id, "stats");
        const statsEmbed = new Discord.MessageEmbed()
            .setAuthor(`${message.guild.name}'s Statistics`, message.guild.iconURL())
            .setColor(message.member.displayHexColor)
            .setDescription(`**Total Training Sessions:** ${guildStats.trainingSessions}\n**Total Spawns:** ${guildStats.spawns}\n**Total Trivia Questions:** ${guildStats.triviaQuestions}`)
            .setFooter(`Utilizing ${bot.user.username} since ${moment.tz(message.guild.me.joinedTimestamp, bot.timezone).format("llll")}`)
            .setTimestamp();

        message.channel.send(statsEmbed);
    },
};
