const moment = require("moment-timezone");

module.exports = {
	name: "pensieve",
	description: "Reminds you of a message of your choosing at the given time.",
	aliases: ["remindme", "remembrall"],
	async execute(message, args, bot) {
		if (!args[0]) {
			return message.channel.send(`Specify what to remind you! Proper Usage: \`${bot.prefix}pensieve <reminder> <days:hours:minutes>\``);
		}

		args = message.content.split(/ +/);
		args.shift();

		const reminder = args.slice(0, args.length - 1).join(" ");
		let time = args[args.length - 1].match(/\d+:\d+:\d+/);
		if (!time) {
			return message.channel.send(`Specify when to remind you! Proper Usage: \`${bot.prefix}pensieve <reminder> <days:hours:minutes>\``);
		}

		time = time[0].split(/:/).map(t => parseInt(t));

		const timeObject = moment.tz("America/Los_Angeles")
			.add(time[0], "days")
			.add(time[1], "hours")
			.add(time[2], "minutes");

		const object = {
			reminder: reminder,
			time: timeObject.valueOf()
		};

		bot.userInfo.push(message.author.key, object, "reminders");
		message.channel.send(`Got it! I will remind you in **${time[0]} days, ${time[1]} hours, and ${time[2]} minutes** to **${reminder}**`);
	},
};
