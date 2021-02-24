const Enmap = require("enmap");
const dataDir = "./data";

module.exports = {
    userInfo: new Enmap({
        name: "users",
        dataDir
    }),
    guildInfo: new Enmap({
        name: "guilds",
        dataDir
    })
};