const functions = require("../utils/functions.js");
const botconfig = require("../botconfig.json");

module.exports = async (bot, oldState, newState) => {
    if (!newState.channel || (oldState.channel && oldState.channel.id == botconfig.ostChannel) || newState.channel.id != botconfig.ostChannel) return;
    if (newState.channel.members.filter(m => !m.user.bot).length > 0) return;
    functions.playOST(newState.channel, bot);
};