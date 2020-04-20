const yargs = require("yargs")

const options = yargs
 .usage("Usage: -u <url> -n <name> -p <password>")
 .option("u", { alias: "url", describe: "Mumble Server URL with Port", type: "string", demandOption: true })
 .option("n", { alias: "name", describe: "Bot Username", type: "string", demandOption: true })
 .option("p", { alias: "password", describe: "Bot Password", type: "string", demandOption: false })
 .argv

module.exports = options