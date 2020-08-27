const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");

module.exports = {
    name: "ost-play",
    description: "Play the Harry Potter OST",
    async execute(message, args, bot) {
        const ostChannel = message.guild.channels.cache.get("748611695441870988");
        if (!["356172624684122113", "137269251361865728"].includes(message.author.id)) return;
        if (ostChannel.members.has(bot.user.id)) return message.channel.send("I am already playing the Harry Potter OST! Join the <#748611695441870988> voice channel to listen!");
        const connection = await ostChannel.join().catch(e => console.error(e.stack));

        const playlist = await ytpl("https://www.youtube.com/playlist?list=PLVdr7xrwRyjY4DGuP-NUFEKYupdow4qGq");
        const queue = playlist.items.map(i => i.url_simple); // Creates a list of youtube videos that create the hp ost.
        let index = 5;

        let dispatcher = connection.play(ytdl(queue[index - 1],
            {
                quality: "highestaudio"
            })
        );

        dispatcher.on("start", () => {
            message.channel.send("Got it! I'm now playing the Harry Potter OST in the <#748611695441870988> voice channel");

        });

        dispatcher.on("finish", () => {
            index++;
            if (!queue[index - 1]) index = 1;

            dispatcher = connection.play(ytdl(queue[index - 1],
                {
                    quality: "highestaudio"
                })
            );
        });

        dispatcher.on("error", console.error);
    },
};
