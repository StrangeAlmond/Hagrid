const nerds = require("nerds");

module.exports = {
	name: "character",
	description: "Get information about a random harry potter character.",
	aliases: ["randomcharacter"],
	async execute(message) {
		const character = nerds.resolve("Harry Potter").asArray()[0];
		message.channel.send(`Name: ${character.full}\nBlood Status: ${character.blood_status}\nBirthday: ${character.birthday}\nGender: ${character.gender}\nHouse: ${character.house}\nWand: ${character.wand}`);
	},
};
