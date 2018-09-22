//
const path = require("path");
const chalk = require("chalk");
const moment = require("moment");
const fetch = require("node-fetch");
const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");

const { leaderboard } = require("../../api");

module.exports.command = "leaderboard";
module.exports.describe = false;

module.exports.builder = yargs => yargs;

const compute = ({ wins, losses, ties }) => ({
  wins: wins,
  losses: losses,
  ties: ties,
  score: 3 * wins + ties
});

function sortUsers(a, b) {
  return a.stats.score < b.stats.score ? 1 : -1;
}

module.exports.handler = handleErrors(async argv => {
  const team = await getTeam();

  if (!team) {
    return console.log(
      "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
    );
  }

  const leaderboardScores = await leaderboard(team);

  console.log(
    Object.values(leaderboardScores.scores)
      .sort((a, b) => b.score - a.score)
      .map(
        ({ team: { name, latestScript }, wins, losses, ties, score }) =>
          `${String(score).padEnd(3)} ${chalk.green(
            name.padEnd(30)
          )}${chalk.green(String(wins).padEnd(2))}/${chalk.red(
            String(losses).padEnd(2)
          )}/${chalk.yellow(String(ties).padEnd(4))} ${chalk.gray(
            moment(latestScript.createdAt).fromNow()
          )}`
      )
      .join("\n")
  );
  if (leaderboardScores.toBePlayed) {
    console.log(
      chalk.red(
        `WARNING: Still waiting for ${
          leaderboardScores.toBePlayed.length
        } matches to be played`
      )
    );
  }
});
