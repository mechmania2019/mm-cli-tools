// @flow
const opn = require("opn");
const chalk = require("chalk");
const handleErrors = require('../utils/handleErrors')

module.exports.command = ["twitch", "tv"];
module.exports.describe = "Watch your bots compete live on Twitch!";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async (argv: {}) => {
  opn("https://twitch.tv/mechmania_tv");
});
