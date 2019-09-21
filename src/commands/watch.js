// @flow
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mkdirp = promisify(require("mkdirp"));
const { match: getMatch, matches, versions } = require("../api");
const { getTeam } = require("../utils/auth");
const inquirer = require("inquirer");
const moment = require("moment");
const chalk = require("chalk");

const result = require("../utils/result");
const checkGameVersion = require("../utils/checkGameVersion");
const handleErrors = require("../utils/handleErrors");
const visualize = require("../utils/visualize");

const TMP_DIR = path.join(os.tmpdir(), "mm");
const LOG_PATH = path.join(TMP_DIR, "last.log.txt");

const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const stat = promisify(fs.stat);

module.exports.command = "watch";
module.exports.describe = "Watch any match that your bot played";

module.exports.builder = (yargs: any) =>
  yargs
    .option("logfile", {
      type: "string",
      describe:
        "Provide a path to a logfile to write the game logs to instead of watching it on the visualizer"
    })
    .option("input", {
      type: "string",
      describe: "Provide a path to a logfile to visualize"
    });

module.exports.handler = handleErrors(
  async (argv: { input: ?string, logfile: ?string }) => {
    const input = argv.input && path.resolve(argv.input);
    const logfile = argv.logfile && path.resolve(argv.logfile);
    const team = await getTeam();
    const me = team.name;

    if (!logfile) {
      try {
        await access(visualize.getVisualizer(), fs.constants.X_OK);
      } catch (e) {
        console.error(
          "Could not find visualizer. Run `mm download` before trying this again."
        );
        process.exit(1);
      }
      await checkGameVersion();

      if (input) {
        console.log("Just using the input to visualize.");
        await visualize(input);
        return;
      }
    }

    const remoteVersions = await versions(team);
    if (!remoteVersions.length) {
      console.log(
        chalk.blue(
          "Looks like you haven't pushed any scripts yet! Use `mm push` on your bot's directory first to begin watching games."
        )
      );
      process.exit(0);
    }
    const script = remoteVersions[0].key;

    console.log(`Fetching matches played for version: ${script}`);
    const matchesPlayed = await matches(team, script);

    if (matches.length < 1) {
      console.log(
        chalk.yellow`Your bot has not played any matches yet. You may have to wait a few minutes for new matches to appear here. Check ${chalk.green(
          `mm logs`
        )} to see if it's ready.`
      );
      return;
    }

    const { match } = await inquirer.prompt([
      {
        type: "list",
        name: "match",
        choices: matchesPlayed.map(m => ({
          name: `${m.opponent} - ${result(m.result)}`,
          value: m.match.key
        }))
      }
    ]);

    console.log(`Fetching match ${match}`);
    const matchDataRes = await getMatch(team, match);

    // const t1 = matchDataRes.headers.get("x-team-1");
    // const t2 = matchDataRes.headers.get("x-team-2");
    const matchData = await matchDataRes.text();

    console.log("Setting up visualizer");
    // Assert tmpdir
    if (!logfile) {
      await mkdirp(TMP_DIR);
    }
    await writeFile(logfile || LOG_PATH, matchData);
    await visualize(logfile || LOG_PATH);
  }
);
