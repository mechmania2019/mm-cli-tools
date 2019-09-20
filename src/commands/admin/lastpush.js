//
const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");

const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const { teams } = require("../../api");

module.exports.command = "lastpush";
module.exports.describe =
  "Get a list of all the teams with information on when they last pushed a bot";

module.exports.builder = yargs => yargs;

function TeamLog(name, script, latestPush) {
  this.Team = name;
  this.LatestScript = script;
  this.LastPush = latestPush;
}

module.exports.handler = handleErrors(async argv => {
  const team = await getTeam();
  if (!team) {
    return console.log(
      "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
    );
  }
  const teamList = await teams(team);
  console.table( 
    teamList.map(
      ({ name, latestScript, mostRecentPush }) =>
        new TeamLog(
        chalk.red(name),
        latestScript
            ? `${latestScript.key} (${moment(latestScript.createdAt).fromNow()})`
            : `NA`,
        mostRecentPush
            ? `${mostRecentPush.key} (${moment(mostRecentPush.createdAt).fromNow()})`
            : `NA`
        )
    )
  );

});
