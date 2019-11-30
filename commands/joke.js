const jokes = require("../jsonFiles/jokes.json");

module.exports = {
  name: "joke",
  description: "get a random joke",
  aliases: ["randjoke"],
  async execute(message, args, bot) {
    // Get a random joke
    const joke = jokes[Math.floor(Math.random() * (jokes.length - 0 + 1)) + 0];

    // Send the joke
    await bot.quickWebhook(message.channel, joke.joke, {
      username: "Peeves",
      avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/9/9c/Peeves-PM-17-10-17.gif/revision/latest?cb=20171018234135"
    });

    setTimeout(() => {
      // Send the punchline after 2 seconds
      bot.quickWebhook(message.channel, joke.answer, {
        username: "Peeves",
        avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/9/9c/Peeves-PM-17-10-17.gif/revision/latest?cb=20171018234135",
        deleteAfterUse: true
      });
    }, 2000);
  },
};
