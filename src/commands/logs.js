// @flow
const path = require("path");
const chalk = require("chalk");

const { getTeam } = require("../utils/auth");
const handleErrors = require("../utils/handleErrors");

const { log } = require("../api");

module.exports.command = ["log", "logs"];
module.exports.describe = "Get the logs from compiling your script";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async (argv: {}) => {
  const team = await getTeam();

  if (!team) {
    return console.log(
      `Nobody is currently logged in. Use \`${chalk.red(
        `mm login`
      )}\` to login or \`${chalk.red(`mm register`)}\` to create a new team.`
    );
  }
  console.log("Getting the build logs for your latest bot");

  try {
    console.log(await log(team));
    console.log(
      chalk.blue(
        "The logs from building your bot are above. If it has the phrase `Successfully built`, then it's all good! Otherwise, look at the errors and try to debug."
      )
    );
  } catch (e) {
    console.error(
      `Error fetching your bot's logs. It may still be building. Try again later`
    );
  }
});
