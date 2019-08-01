const Discord = require("discord.js");

module.exports = {
  name: "meritwheel",
  description: "Merit Wheel",
  aliases: ["wheelmerit", "meritswheel", "wheelofmerits"],
  async execute(message, args, bot) {
    const users = message.guild.members.filter(m => !m.roles.find(r => r.name === "Unsorted") && !m.user.bot && m.id !== message.author.id);
    const user = users.randomKey();

    message.channel.send(`Out of a list of ${users.size} members I pick ${message.guild.members.get(user).displayName}`);
  },
};
