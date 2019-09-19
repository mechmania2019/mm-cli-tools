const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");

const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const { queueall } = require("../../api");

module.exports.command = "queue-all";
module.exports.describe = false;

module.exports.builder = yargs => yargs;

module.exports.handler = handleErrors(async () => {
    const team = await getTeam();

    if (!team) {
        return console.log(
            `Nobody is currently logged in. Use \`${chalk.red(
              `mm login`
            )}\` to login or \`${chalk.red(`mm register`)}\` to create a new team.`
          );
    }
    console.log("Queueing up a fresh batch of games.");

    try {
        console.log(await queueall(team));
        console.log(
            chalk.blue(
                "Everyone is now queued up!"
            )
        );
    } catch (e) {
        console.error(
            `Error queueing everyone up`, e
        );
    }
});