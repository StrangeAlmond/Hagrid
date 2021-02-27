const Discord = require("discord.js");
const db = require("../utils/db.js");
const sm = require("string-similarity");

module.exports = {
    name: "collectibles",
    description: "View your collected items.",
    aliases: ["collected"],
    async execute(message, args, bot) {
        if (args[0] && !message.mentions.members.first()) {
            let item = bot.functions.toCamelCase(args.join(" "));

            if (!db.userInfo.has(message.author.key, `collectibles.${item}`)) {
                const possibleItems = Object.keys(db.userInfo.get(message.author.key, "collectibles"));
                item = sm.findBestMatch(bot.functions.toCamelCase(args.join(" ")), possibleItems).bestMatch.target;
            }

            const itemEmbed = new Discord.MessageEmbed()
                .setAuthor("Collectibles Search", message.author.displayAvatarURL())
                .setColor(message.member.displayHexColor)
                .setDescription(`**${item.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:** ${db.userInfo.get(message.author.key, `collectibles.${item}`)}`)
                .setTimestamp();
            message.channel.send(itemEmbed);
        } else {
            const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
            const memberData = db.userInfo.get(`${message.guild.id}-${member.id}`);

            let usersInventoryMessage = Object
                .entries(memberData.collectibles) // Get all the entries from their collectibles in a [key, value] format
                .filter(i => i[1] > 0) // Filter out items which the user does not have
                .sort((i, j) => i[0].localeCompare(j[0])) // Sort it alphabetically
                .map(i => `**${i[0].replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}:** ${i[1]}`) // Convert the key into a user-readable format
                .join("\n"); // Join it all together seperated by a line break

            const inventoryEmbed = new Discord.MessageEmbed()
                .setAuthor(`${member.displayName}'s Collectibles`, member.user.displayAvatarURL())
                .setDescription(usersInventoryMessage)
                .setColor(member.displayHexColor)
                .setTimestamp();

            message.channel.send(inventoryEmbed);
        }
    },
};
