// @flow
const chalk = require("chalk");
const { log, versions } = require("../api");
const { getTeam } = require("../utils/auth");
const handleErrors = require("../utils/handleErrors");
const moment = require("moment");
const inquirer = require("inquirer");

module.exports.command = ["log", "logs"];
module.exports.describe = "Get the logs from compiling your script";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async () => {
  let team = await getTeam();

  const choices = (await versions(team)).map(({ key, createdAt }) => ({
    name: moment(createdAt).from(),
    value: key
  }));

  if (!choices.length) {
    console.log(
      chalk.blue(
        "Looks like you haven't pushed any scripts yet! Use `mm push` on your bot's directory first so we can show you stats on how well it fares."
      )
    );
    process.exit(0);
  }

  const { script } = await inquirer.prompt([
    {
      type: "list",
      name: "script",
      choices
    }
  ]);

  console.log(`Getting the build logs for ${script}`);

  const logs = await log(team, script);

  try {
    console.log(logs);
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
