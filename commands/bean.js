module.exports = {
	name: "bean",
	description: "Get/collect a flavored jelly bean from Bertie Bott's Beans.",
	aliases: ["jellybean"],
	async execute(message, args, bot) {
		if (!bot.userInfo.hasProp(`${message.guild.id}-${message.author.id}`, "inventory.beans")) {
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, 0, "inventory.beans");
			bot.userInfo.set(`${message.guild.id}-${message.author.id}`, [], "stats.uniqueBeansEaten");
		}
		// Check if they have any beans
		if (bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "inventory.beans") <= 0) {
			return bot.quickWebhook(message.channel, "You don't have any beans! buy some with !buy 1002", {
				username: "Bertie Bott",
				avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/2/27/Bertie_Bott_Portrait.jpg/revision/latest/scale-to-width-down/220?cb=20150611184208&path-prefix=sv",
				deleteAfterUse: true
			});
		}

		// Find a flavour, and get their uniqueBeans
		const flavours = ["Almond", "Apple", "Aubergine", "Bacon", "Baked Bean", "Banana", "Belly Button Lint", "Beef Casserole", "Black Pepper", "Blueberry", "Blueberry Pie", "Bogey", "Bouillabaisse", "Broccoli", "Bubble-Gum", "Buttered Popcorn", "Cauliflower", "Cheese", "Cherry", "Chicken", "Chilli", "Chilli Powder", "Chocolate", "Cinnamon", "Coconut", "Coffee", "Cranberry", "Cream Puff", "Curry", "Dirt", "Dirty Sock", "Dog Food", "Earthworm", "Earwax", "Eclair", "Envelope Glue", "Farm Dirt", "Fish", "Grape Jelly", "Grapefruit", "Grass", "Gravy", "Green Apple", "Ham", "Honey", "Horseradish", "Ketchup", "Lemon", "Liver", "Liver and Tripe", "Lobster", "Marmalade", "Marshmallow", "Mashed Potatoes", "Mint", "Mushroom", "Mussel", "Mustard", "Olive", "Onion", "Overcooked Cabbage", "Peach", "Pear", "Pepper", "Peppermint", "Phlegm", "Pink Grapefruit", "Pizza", "Prawn", "Pumpkin", "Roast Beef", "Rotten Egg", "Salmon", "Sardine", "Sausage", "Sherry", "Soap", "Spaghetti", "Spinach", "Sprout", "Strawberry", "Strawberry and Peanut-Butter Ice-Cream", "Sugared Violet", "Sulphur", "Toast", "Toffee", "Toffee Pudding", "Tomato", "Tripe", "Troll Bogey", "Tutti-Frutti", "Vomit", "Watermelon"];
		const flavour = flavours[Math.floor(Math.random() * (flavours.length - 0)) + 0];
		const uniqueBeans = bot.userInfo.get(`${message.guild.id}-${message.author.id}`, "stats.uniqueBeansEaten");

		// ++ their "beansEaten" stat, -- their "inventory.beans" stat
		bot.userInfo.inc(`${message.guild.id}-${message.author.id}`, "stats.beansEaten");
		bot.userInfo.dec(`${message.guild.id}-${message.author.id}`, "inventory.beans");

		// Add the flavour to their stats if they haven't eaten it before
		if (!uniqueBeans.includes(flavour)) {
			bot.userInfo.push(`${message.guild.id}-${message.author.id}`, flavour, "stats.uniqueBeansEaten");
		}

		// Send the bean message
		bot.quickWebhook(message.channel, `${message.member.displayName}, Your bean is... ${flavour} flavoured!`, {
			username: "Bertie Bott",
			avatar: "https://vignette.wikia.nocookie.net/harrypotter/images/2/27/Bertie_Bott_Portrait.jpg/revision/latest/scale-to-width-down/220?cb=20150611184208&path-prefix=sv",
			deleteAfterUse: true
		});
	},
};
