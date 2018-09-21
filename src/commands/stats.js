// @flow

const { stats, versions } = require("../api");
const { getTeam } = require("../utils/auth");
const inquirer = require("inquirer");
const moment = require("moment");

const handleErrors = require("../utils/handleErrors");

module.exports.command = "stats";
module.exports.describe = "Get stats for your bots";

module.exports.builder = (yargs: any) => yargs;

module.exports.handler = handleErrors(async () => {
  let team;
  try {
    team = await getTeam();
  } catch (e) {
    console.log("Not logged in");
    process.exit(0);
  }

  const choices = (await versions(team)).map(({ key, createdAt }) => ({
    name: moment(createdAt).from(),
    value: key
  }));

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
