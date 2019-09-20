//@flow

const { stats, versions } = require("../api");
const { getTeam } = require("../utils/auth");
const inquirer = require("inquirer");
const moment = require("moment");
const chalk = require("chalk");

const handleErrors = require("../utils/handleErrors");

module.exports.command = "stats";
module.exports.describe = false;

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async () => {
  console.log("mm stats is currently disabled.");
  return;
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

  console.log(`Fetching stats for version: ${script}`);
  const { wins, losses, ties } = await stats(team, script);
  console.log(`
Wins: ${wins}
Losses: ${losses}
Ties: ${ties}
`);
});
