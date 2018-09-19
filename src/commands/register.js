// @flow
const path = require("path");
const { promisify } = require("util");

const chalk = require("chalk");

const { register } = require("../utils/auth");
const { createRL, cmdQuestion } = require("../utils/prompt");
const handleErrors = require("../utils/handleErrors");

module.exports.command = "register";
module.exports.describe = "Create a new team";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async (argv: {}) => {
  const close = createRL();
  // prompt Team name and Email
  const name = await cmdQuestion("Team Name: ");
  const email = await cmdQuestion(
    "Email (used for communication during/after the tournament): "
  );

  const team = await register(name, email);

  if (!team) {
    console.log(
      "Failed to register - Team name may already exist or registration is closed"
    );
  } else {
    console.log("Registered your team as %s", team.name);
    console.log(
      `Ask your friends to run \`mm login ${chalk.blue(team.token)}\` to join`
    );
  }

  close();
});
