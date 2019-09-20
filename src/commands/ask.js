// @flow
const opn = require("opn");
const chalk = require("chalk");
const handleErrors = require('../utils/handleErrors')

module.exports.command = ["ask", "question", "faq", "wtf", "piazza"];
module.exports.describe = "Ask the mechmania staff a question";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async (argv: {}) => {
  opn("https://piazza.com/class/i69uo2ijxwm4ql");
});
