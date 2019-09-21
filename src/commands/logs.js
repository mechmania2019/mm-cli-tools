// @flow
const chalk = require("chalk");
const { log, runtimelog, versions } = require("../api");
const { getTeam } = require("../utils/auth");
const handleErrors = require("../utils/handleErrors");
const moment = require("moment");
const inquirer = require("inquirer");

module.exports.command = ["log", "logs"];
module.exports.describe = "Get the logs from compiling your script";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async () => {
  let team = await getTeam();

  const choices = (await versions(team)).map(
    ({ key, createdAt, isLatestScript, isMostRecentPush }) => ({
      name: `${moment(createdAt).from()}${
        isLatestScript
          ? chalk.green(" active")
          : isMostRecentPush
          ? chalk.yellow(" building")
          : ""
      }`,
      value: key
    })
  );

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

  console.log(`Getting the logs for ${script}`);

  const compileLogs = await log(team, script);
  const runtimeLogs = await runtimelog(team, script);

  var allLogData = "\n\n ------------------------- Compile logs ------------------------- \n\n";
  
  try {
    allLogData = allLogData.concat(compileLogs);
  } catch (e) {
    console.error(
      `Error in fetching compile logs`, e
    )
  }

  try {
    allLogData = allLogData.concat("\n\n ------------------------- Runtime logs ------------------------- \n\n", runtimeLogs);
  } catch (e) {
    console.error(
      `Error in fetching runtime logs`, e
    )
  }

  try {
    console.log(allLogData);
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
