const Discord = require("discord.js");

module.exports = {
  name: "leaderboard",
  aliases: ["board"],
  description: "Sends the servers leaderboard",
  async execute(message, args, bot) {

    if (!args[0]) return message.channel.send("Specify the leaderboard you'd like to view!");

    const leaderboards = {
      "points": "stats.housePoints",
      "xp": "stats.lifetimeXp",
      "merits": "stats.merits",
      "purchases": "stats.purchases",
      "forages": "stats.forages",
      "potions made": "stats.potionsMade",
      "potions used": "stats.potionsUsed",
      "beans": "stats.beansEaten",
      "trivia": "stats.triviaAnswered",
      "chests": "stats.chestsOpened",
      "dementors": "stats.dementorsDefeated",
      "boggarts": "stats.boggartsDefeated",
      "duels won": "stats.duelsWon",
      "duels lost": "stats.duelsLost",
      "max health": "stats.maxHealth",

      "galleons": "balance.galleons",
      "sickles": "balance.sickles",
      "knuts": "balance.knuts"
    };

    const leaderboardEntries = Object.entries(leaderboards);
    const leaderboardDetails = leaderboardEntries.find(entry => entry[0].includes(args.join(" ")));

    if (!leaderboardDetails) return;

    const leaderboardName = leaderboardDetails[0];
    const leaderboardKey = leaderboardDetails[1];

    const users = bot.userInfo.array().filter(u => bot.userInfo.get(`${u.guild}-${u.user}`, leaderboardKey) > 0);
    const sortedUsers = users.sort((a, b) => bot.userInfo.get(`${b.guild}-${b.user}`, leaderboardKey) - bot.userInfo.get(`${a.guild}-${a.user}`, leaderboardKey));
    const leaderboard = sortedUsers.splice(0, 10);

    const leaderboardEmbed = new Discord.RichEmbed()
      .setAuthor(`${formatLeaderboardName(leaderboardName)} Leaderboard`, message.guild.iconURL)
      .setColor(message.member.displayHexColor)
      .setTimestamp();

    for (const user of leaderboard) {
      leaderboardEmbed.addField(message.guild.members.get(user.user).displayName, `${bot.userInfo.get(`${user.guild}-${user.user}`, leaderboardKey)} ${formatLeaderboardName(leaderboardName)}`);
    }

    message.channel.send(leaderboardEmbed);

    function formatLeaderboardName(name) {
      return name.split(/ +/).map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(" ");
    }
  }
};
