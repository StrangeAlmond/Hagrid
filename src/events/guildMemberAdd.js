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
    const roleObject = await member.guild.roles.cache.find(r => r.name.toLowerCase() == role.toLowerCase());
    member.roles.add(roleObject).catch(e =>
      bot.log(`Error adding roles to new member: ${e.stack}`, "error")
    );
  });

  const channel = member.guild.channels.cache.find(c => c.name == "the-leaky-cauldron");
  const gringotts = member.guild.channels.cache.find(c => c.name == "gringotts");
  const ollivanders = member.guild.channels.cache.find(c => c.name == "ollivanders");
  const flourishAndBlotts = member.guild.channels.cache.find(c => c.name == "flourish-and-blotts");
  const madamMalkins = member.guild.channels.cache.find(c => c.name == "madam-malkins");
  const potages = member.guild.channels.cache.find(c => c.name == "potages");
  const wisacres = member.guild.channels.cache.find(c => c.name == "wiseacres");

  channel.send(`${member}, Welcome to Diagon Alley!
  
Here, you'll find everythin' yeh need to get started. Firs' things firs', look at the menu on the left to see all the shops 'ere in Diagon Alley. Before yeh can start shoppin', you'll need to go to ${gringotts} bank an' **${bot.prefix}withdraw** some funds so yeh can buy yer school supplies.
  
Affer that, make sure to visit all the shops to gather the required items for yer firs' year at Hogwarts. After yer done shoppin, yeh'll be able to board the Hogwarts Express. Here's a list of what yeh need and where to find it:
  
Wand - ${ollivanders}
**${bot.prefix}buy wand**
  
School Books - ${flourishAndBlotts}
**${bot.prefix}buy books**
  
Robes/Hat/Gloves - ${madamMalkins}
**${bot.prefix}buy clothes**
  
Cauldron (Pewter, standard size 2) - ${potages}
**${bot.prefix}buy cauldron**
  
Crystal phials, telescope, brass scales - ${wisacres}
**${bot.prefix}buy supplies**`);
};
