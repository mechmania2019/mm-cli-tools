const chalk = require("chalk")

const colorDict = { "win": "green", "loss": "red", "tie": "blue" };

module.exports = str => chalk[colorDict[str]](str);