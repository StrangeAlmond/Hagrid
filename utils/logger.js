const moment = require("moment-timezone");
const chalk = require("chalk");
const fs = require("fs");

function log(message, level, file) {
	if (!level) level = "info"; // Default level
	if (!file) file = "logs.txt"; // Default file

	const time = moment.tz("America/Los_Angeles").format("LLLL"); // Get the current time

	let m = ""; // Use a message variable that will be updated by the switch-case statement below

	switch (level) { // Different color with chalk depending on the level
		case ("info"):
			m = `${time} - [INFO]\n${message}\n\n`;
			console.log(chalk.green(m));
			break;

		case ("debug"):
			m = `${time} - [DEBUG]\n${message}\n\n`;
			console.log(chalk.blue(m));
			break;

		case ("error"):
			m = `${time} - [ERROR]\n${message}\n\n`;
			console.log(chalk.red(m));
			break;
	}

	fs.appendFile(`./${file}`, m, (err) => { // Write the message variable to the log file
		if (err) throw err;
	});
}

module.exports = log;
