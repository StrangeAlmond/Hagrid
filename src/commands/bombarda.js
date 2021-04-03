const Discord = require("discord.js");
const db = require("../utils/db.js");
const availableLocations = ["27.05"];

module.exports = {
    name: "bombarda",
    description: "The exploding charm",
    async execute(message, args, bot) {
        const userData = db.userInfo.get(message.author.key);
        const curPos = userData.mazeInfo.curPos;
        const curLevel = userData.mazeInfo.curMaze;

        if (!userData.studiedSpells.includes("bombarda")) return;
        if (!availableLocations.includes(curPos)) return;

        if (userData.mazeInfo.curPos == "27.05" && !userData.mazeInfo.lvl2CaveUnlocked) {
            message.channel.send("You cast bombarda and the rocks in front of you crumble to dust.");
            db.userInfo.set(message.author.key, true, "mazeInfo.lvl2CaveUnlocked");
            message.channel.send(new Discord.MessageAttachment(`../images/forbidden_forest/${curLevel}/Active/Forest_${curPos}.png`, "map.png"));
        }
    },
};
