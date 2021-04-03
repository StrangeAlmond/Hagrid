const Discord = require("discord.js");
const db = require("../utils/db.js");
const availableLocations = ["26.05"];

module.exports = {
    name: "lumos",
    description: "The wand-lighting spell.",
    async execute(message, args, bot) {
        const userData = db.userInfo.get(message.author.key);
        const curPos = userData.mazeInfo.curPos;
        const curLevel = userData.mazeInfo.curMaze;

        if (!userData.studiedSpells.includes("lumos")) return;
        if (!availableLocations.includes(curPos)) return;

        if (userData.mazeInfo.curPos == "26.05" && !userData.mazeInfo.lvl2CaveLit) {
            message.channel.send("You cast lumos and the cave is brilliantly illuminated with the cold shine of your wand.");
            db.userInfo.set(message.author.key, true, "mazeInfo.lvl2CaveLit");
            message.channel.send(new Discord.MessageAttachment(`../images/forbidden_forest/${curLevel}/Active/Forest_${curPos}.png`, "map.png"));
        }
    },
};
