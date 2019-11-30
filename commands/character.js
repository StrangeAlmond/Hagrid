const nerds = require("nerds");

module.exports = {
  name: "character",
  description: "Get a random character name",
  aliases: ["randomcharacter"],
  async execute(message) {
    // Get a random harry potter character and send their info
    const HpCharacter = nerds.resolve("Harry Potter").asArray()[0];

    // Send info about that character
    message.channel.send(`Name: ${HpCharacter.full}\nBlood Status: ${HpCharacter.blood_status}\nBirthday: ${HpCharacter.birthday}\nGender: ${HpCharacter.gender}\nHouse: ${HpCharacter.house}\nWand: ${HpCharacter.wand}`);
  },
};
