//@flow
const { promisify } = require("util");
const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");
const fs = require("fs");
const os = require("os");
const mkdirp = promisify(require("mkdirp"));

const result = require("../../utils/result");
const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const {
  teams,
  versions,
  matches,
  log,
  runtimelog,
  match: getMatch,
  matchErrors
} = require("../../api");
const visualize = require("../../utils/visualize");
const checkGameVersion = require("../../utils/checkGameVersion");

const TMP_DIR = path.join(os.tmpdir(), "mm");
const LOG_PATH = path.join(TMP_DIR, "last.log.txt");
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);

module.exports.command = "user";
module.exports.describe = false;

module.exports.builder = (yargs: any) =>
  yargs
    .option("logfile", {
      type: "string",
      describe:
        "Provide a path to a logfile to write the game logs to. Errors are written to -err"
    })
    .option("visualizer", {
      type: "boolean",
      default: true,
      describe: "Enable the viusualizer"
    });

module.exports.handler = handleErrors(
  async (argv: { logfile: ?string, visualizer: boolean }) => {
    const team = await getTeam();
    const logfile = argv.logfile && path.resolve(argv.logfile);
    const visualizer = argv.visualizer;

    if (!team) {
      return console.log(
        "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
      );
    }
    const users = await teams(team);

    const choices = users.map(user => ({
      name: user.name,
      value: user
    }));

    const { chosenTeam } = await inquirer.prompt([
      {
        type: "list",
        name: "chosenTeam",
        choices
      }
    ]);

    const allUserVersions = await versions(chosenTeam);

    const versionIds = allUserVersions.map(
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

    const modes = ["info", "versions", "matches", "logs", "watch"];

    const { mode } = await inquirer.prompt([
      {
        type: "list",
        name: "mode",
        choices: modes
      }
    ]);

    switch (mode) {
      case "info":
        console.log(`Name: ${chosenTeam.name}`);
        console.log(`Email: ${chosenTeam.email}`);
        console.log(`Token: ${chosenTeam.token}`);
        console.log(`Most recent push: ${chosenTeam.mostRecentPush.key}`);
        console.log(`Latest working script: ${chosenTeam.latestScript.key}`);
        break;

      case "versions":
        if (allUserVersions.length === 0) {
          console.log("This team has not pushed any scripts");
        } else {
          for (let i = 0; i < allUserVersions.length; i++) {
            console.log(allUserVersions[i].key);
          }
          const chosenVersion = await inquirer.prompt([
            {
              type: "list",
              name: "version",
              choices: versionIds
            }
          ]);
          const script = await fetch(
            `https://mechmania2019.s3.amazonaws.com/scripts/${chosenVersion.version}`
          );
          const fileStream = fs.createWriteStream(
            require("path").join(require("os").homedir(), "Desktop")
          );
          await new promise((resolve, reject) => {
            res.body.pipe(fileStream);
            res.body.on("error", err => {
              reject(err);
            });
            fileStream.on("finish", function() {
              resolve();
            });
          });
        }
        break;

      case "matches":
        if (allUserVersions.length === 0) {
          console.log("This user has not pushed any scripts check back later.");
        } else {
          const chosenVersion = await inquirer.prompt([
            {
              type: "list",
              name: "version",
              choices: versionIds
            }
          ]);
          const allMatches = await matches(chosenTeam, chosenVersion.version);

          let wins = 0;
          let losses = 0;
          let ties = 0;

          for (let i = 0; i < allMatches.length; i++) {
            if (allMatches[i].result === "win") {
              wins++;
            } else if (allMatches[i].result === "loss") {
              losses++;
            } else {
              ties++;
            }
            console.log(
              `${allMatches[i].opponent.toString().padEnd(30, " ")} ${result(
                allMatches[i].result
              )}`
            );
          }

          console.log(
            `${chalk.green(`Total Wins: ${wins}`)}, ${chalk.red(
              `Total Losses: ${losses}`
            )}, ${chalk.blue(`Total Ties: ${ties}`)}`
          );
        }
        break;

      case "logs":
        if (allUserVersions.length === 0) {
          ("This user has not pushed any scripts check back later.");
        } else {
          const chosenVersion = await inquirer.prompt([
            {
              type: "list",
              name: "version",
              choices: versionIds
            }
          ]);

          console.log(`Getting the logs for ${chosenVersion.version}`);

          const compileLogs = await log(chosenTeam, chosenVersion.version);
          const runtimeLogs = await runtimelog(
            chosenTeam,
            chosenVersion.version
          );

          var allLogData =
            "\n\n ------------------------- Compile logs ------------------------- \n\n";

          try {
            allLogData = allLogData.concat(compileLogs);
          } catch (e) {
            console.error(`Error in fetching compile logs`, e);
          }

          try {
            allLogData = allLogData.concat(
              "\n\n ------------------------- Runtime logs ------------------------- \n\n",
              runtimeLogs
            );
          } catch (e) {
            console.error(`Error in fetching runtime logs`, e);
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
        }
        break;

      case "watch":
        try {
          await access(visualize.getVisualizer(), fs.constants.X_OK);
        } catch (e) {
          console.error(
            "Could not find visualizer. Run `mm download` before trying this again."
          );
          process.exit(1);
        }
        await checkGameVersion();

        const remoteVersions = await versions(chosenTeam);
        if (!remoteVersions.length) {
          console.log(chalk.blue("This team has not pushed any bots yet."));
          process.exit(0);
        }
        const script = remoteVersions[0].key;

        console.log(`Fetching matches played for version: ${script}`);
        const matchesPlayed = await matches(chosenTeam, script);

        if (matches.length < 1) {
          console.log("This bot has not played any games yet.");
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
        const matchDataRes = await getMatch(chosenTeam, match);
        const errorLogsRes = await matchErrors(chosenTeam, match);

        // const t1 = matchDataRes.headers.get("x-team-1");
        // const t2 = matchDataRes.headers.get("x-team-2");
        const matchData = await matchDataRes.text();
        const errorLogs = await errorLogsRes.text();

        console.log("Setting up visualizer");
        // Assert tmpdir
        if (!logfile) {
          await mkdirp(TMP_DIR);
        }
        await writeFile(logfile || LOG_PATH, matchData);
        console.log(`Wrote game log file to ${logfile || LOG_PATH}`);
        if (logfile) {
          await writeFile(logfile + ".error", errorLogs);
          console.log(`Wrote stderr from the game engine to ${logfile + ".error"}`);
        }
        if (visualizer) {
          await visualize(logfile || LOG_PATH);
        }
        break;

      default:
        console.log("You broke the cli tool, congrats. Please report this");
    }
  }
);
