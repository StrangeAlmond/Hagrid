const db = require("../utils/db.js");

module.exports = {
	name: "bean",
	description: "Get/collect a flavored jelly bean from Bertie Bott's Beans.",
	aliases: ["jellybean"],
	async execute(message, args, bot) {
		if (!db.userInfo.has(message.author.key, "inventory.beans")) {
			db.userInfo.set(message.author.key, 0, "inventory.beans");
			db.userInfo.set(message.author.key, [], "stats.uniqueBeansEaten");
		}

		if (db.userInfo.get(message.author.key, "inventory.beans") <= 0) {
			return bot.functions.quickWebhook(message.channel, "You don't have any beans! You can purchase some with the `!buy 1002` command.", {
				username: "Bertie Bott",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/2/27/Bertie_Bott_Portrait.jpg/revision/latest/scale-to-width-down/220?cb=20150611184208&path-prefix=sv",
				deleteAfterUse: true
			});
		}

		const flavours = ["Almond", "Apple", "Aubergine", "Bacon", "Baked Bean", "Banana", "Belly Button Lint", "Beef Casserole", "Black Pepper", "Blueberry", "Blueberry Pie", "Bogey", "Bouillabaisse", "Broccoli", "Bubble-Gum", "Buttered Popcorn", "Cauliflower", "Cheese", "Cherry", "Chicken", "Chilli", "Chilli Powder", "Chocolate", "Cinnamon", "Coconut", "Coffee", "Cranberry", "Cream Puff", "Curry", "Dirt", "Dirty Sock", "Dog Food", "Earthworm", "Earwax", "Eclair", "Envelope Glue", "Farm Dirt", "Fish", "Grape Jelly", "Grapefruit", "Grass", "Gravy", "Green Apple", "Ham", "Honey", "Horseradish", "Ketchup", "Lemon", "Liver", "Liver and Tripe", "Lobster", "Marmalade", "Marshmallow", "Mashed Potatoes", "Mint", "Mushroom", "Mussel", "Mustard", "Olive", "Onion", "Overcooked Cabbage", "Peach", "Pear", "Pepper", "Peppermint", "Phlegm", "Pink Grapefruit", "Pizza", "Prawn", "Pumpkin", "Roast Beef", "Rotten Egg", "Salmon", "Sardine", "Sausage", "Sherry", "Soap", "Spaghetti", "Spinach", "Sprout", "Strawberry", "Strawberry and Peanut-Butter Ice-Cream", "Sugared Violet", "Sulphur", "Toast", "Toffee", "Toffee Pudding", "Tomato", "Tripe", "Troll Bogey", "Tutti-Frutti", "Vomit", "Watermelon"];
		const flavour = flavours[Math.floor(Math.random() * (flavours.length - 0)) + 0];
		const uniqueBeans = db.userInfo.get(message.author.key, "stats.uniqueBeansEaten");

		db.userInfo.inc(message.author.key, "stats.beansEaten");
		db.userInfo.dec(message.author.key, "inventory.beans");

		if (!uniqueBeans.includes(flavour)) {
			db.userInfo.push(message.author.key, flavour, "stats.uniqueBeansEaten");
		}

		bot.functions.quickWebhook(message.channel, `${message.member.displayName}, Your bean is... ${flavour} flavoured!`, {
			username: "Bertie Bott",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/2/27/Bertie_Bott_Portrait.jpg/revision/latest/scale-to-width-down/220?cb=20150611184208&path-prefix=sv",
			deleteAfterUse: true
		});
	},
};
