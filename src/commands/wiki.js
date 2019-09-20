// @flow
const opn = require("opn");
const chalk = require("chalk");
const handleErrors = require('../utils/handleErrors')

module.exports.command = ["wiki", "please-help"];
module.exports.describe = "Visit the Mechmania Wiki";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async (argv: {}) => {
  opn("https://github.com/HoelzelJon/MechMania-25-Wiki/wiki");
});
