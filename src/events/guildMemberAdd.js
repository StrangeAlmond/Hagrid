module.exports = async (bot, member) => {
  if (member.user.bot) return;

  const roles = [
    "First Year",
    "Unsorted",
    "Ollivanders",
    "Flourish and Blotts",
    "Madam Malkins",
    "Wiseacres",
    "Potages",
    "Gringotts"
  ];

  roles.forEach(async role => {
    const roleObject = await member.guild.cache.roles.find(r => r.name === role);
    member.roles.add(roleObject).catch(e =>
      bot.log(`Error adding roles to new member: ${e.stack}`, "error")
    );
  });
};
