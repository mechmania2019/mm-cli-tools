const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");

const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const { flusholdversions } = require("../../api");

module.exports.command = "flush-old-versions";
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
    console.log("Flushing old scripts...");

    try {
        console.log(await flusholdversions(team));
        console.log(
            chalk.blue(
                "Old versions are flushed!"
            )
        );
    } catch (e) {
        console.error(
            `Error in flushing old versions`, e
        );
    }
});