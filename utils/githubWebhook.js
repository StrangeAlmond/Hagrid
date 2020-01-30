// Automatically pulls commits from github
let http = require("http");
let crypto = require("crypto");
const exec = require("child_process").exec;
const logger = require("./logger.js");
const botconfig = require("../botconfig.json");

const secret = botconfig.githubWebhookSecret;
const repo = "/home/strangealmond/Discord-Bots/Hagrid";

function createServer() {
	http.createServer((req, res) => {
		req.on("data", chunk => {
			let sig = "sha1=" + crypto.createHmac("sha1", secret).update(chunk.toString()).digest("hex");

			if (req.headers["x-hub-signature"] == sig) {
				exec("cd " + repo + " && git pull && pm2 reload hagrid");
				logger.log("Pulled a commit from github.", "info");
			}
		});

		res.end();
	}).listen("6574");

}

module.exports = createServer;
