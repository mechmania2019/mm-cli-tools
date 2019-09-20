// @flow
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mkdirp = promisify(require("mkdirp"));
const chalk = require("chalk");
const tar = require("tar");
const execa = require("execa");

const { releases } = require("../api");
const { getGameVersion } = require("../utils/version");
const { getTeam } = require("../utils/auth");
const run = require("../utils/run");
const visualize = require("../utils/visualize");
const handleErrors = require("../utils/handleErrors");

const MM_FILES_DIR = path.join(os.homedir(), ".mm", "files");
const TMP_DIR = path.join(os.tmpdir(), "mm");
const LOG_PATH = path.join(TMP_DIR, "last.log.txt");

const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const stat = promisify(fs.stat);

const sleep = ms => new Promise(r => setTimeout(r, ms));

// const build = async (s1, s2) => {
//   if (!s2) {
//     console.log("Building your bot at %s", s1);
//     const { code } = await run("docker", [
//       "build",
//       s1,
//       "-t",
//       "mechmania.io/bot/1",
//       "-t",
//       "mechmania.io/bot/2"
//     ]);
//     if (code && code !== 0) {
//       console.error("Error building your bot");
//       process.exit(code);
//     }
//   } else {
//     await Promise.all(
//       [s1, s2].map(async (s, i) => {
//         console.log("Building your bot at %s", s);
//         const { code } = await run("docker", [
//           "build",
//           s,
//           "-t",
//           `mechmania.io/bot/${i + 1}`
//         ]);
//         if (code && code !== 0) {
//           console.error("Error building your bot");
//           process.exit(code);
//         }
//       })
//     );
//   }
// };

module.exports.command = "play <bot> [bot2]";
module.exports.describe =
  "Watch your bot play against itself (or another bot). To see other possible commands, run `mm help`";

module.exports.builder = (yargs: any) =>
  yargs
    .positional("bot", {
      type: "string",
      describe: "Path to your bot folder"
    })
    .positional("bot2", {
      type: "string",
      describe:
        "Bot to play against. If left out, your bot plays against itself"
    })
    .option("visualizer", {
      type: "boolean",
      default: true,
      describe:
        "Start the visualizer after the game engine is done processing the game"
    })
    // .option("logfile", {
    //   type: "string",
    //   describe:
    //     "Provide a path to a logfile to write the results of the game engine into (the file can be used as the input to the visualizer)"
    // });
    .option("wait", {
      type: "number",
      describe:
        "Time (in seconds) given for the bot to startup before the game start",
      default: 20
    });

module.exports.handler = handleErrors(
  async (argv: {
    bot: string,
    bot2: ?string,
    visualizer: ?boolean,
    remote: ?boolean,
    logfile: ?string,
    wait: number
  }) => {
    const bot1 =
      argv.bot.toLowerCase() === "human" ? "HUMAN" : path.resolve(argv.bot);
    const bot2 = argv.bot2
      ? argv.bot2.toLowerCase() === "human"
        ? "HUMAN"
        : path.resolve(argv.bot2)
      : bot1;
    const logfile = argv.logfile && path.resolve(argv.logfile);
    const wait = argv.wait;

    if (argv.visualizer) {
      const visualizer = visualize.getVisualizer();
      try {
        await access(visualizer, fs.constants.X_OK);
      } catch (e) {
        console.error(
          "Could not find visualizer. Run `mm download` beofre trying this again."
        );
        process.exit(1);
      }
    }

    if (bot1 !== "HUMAN") {
      try {
        const stats = await stat(bot1);
        if (!stats.isDirectory()) {
          console.error(
            `${bot1} is not a directory. Make sure to run mm play on a directory, not a file.`
          );
          process.exit(1);
        }
      } catch (e) {
        console.error(
          `Error accesssing the directory ${bot1}. Are you sure it exists and you permissions to access it`
        );
        process.exit(1);
      }
    }

    console.log("Checking if you have the latest version");
    const manifest = await releases();
    const local = await getGameVersion();
    const remote = manifest.tag_name;
    console.log(
      `Your game version ${chalk[local === remote ? "green" : "red"](local)}`
    );
    console.log(`Latest version available ${chalk.green(remote)}`);
    if (local !== remote) {
      console.log(
        `You have an outdated version of the game. Run ${chalk.red(
          "mm update"
        )} to get the latest version.`
      );
    }

    let bot1IP = bot1;
    let bot2IP = bot2;
    let bot1Manifest, bot2Manifest;
    try {
      if (bot1 !== "HUMAN") {
        bot1Manifest = require(path.join(bot1, "mm.json"));
      }
      if (bot2 !== "HUMAN") {
        bot2Manifest = require(path.join(bot2, "mm.json"));
      }
    } catch (e) {
      console.log(chalk.red`ERROR Could not parse manifest file`);
      console.error(e);
      process.exit(1);
    }

    if (bot1 !== "HUMAN" && bot1Manifest.build) {
      console.log("Building Bot 1");
      const buildProc1 = execa.command(bot1Manifest.build, {
        cwd: bot1,
        shell: true,
        all: true
      });
      buildProc1.all.pipe(process.stdout);
      await buildProc1;
    }
    if (bot2 !== "HUMAN" && bot2 !== bot1 && bot2Manifest.build) {
      console.log("Building Bot 2");
      const buildProc2 = execa.command(bot2Manifest.build, {
        cwd: bot2,
        shell: true,
        all: true
      });
      buildProc2.all.pipe(process.stdout);
      await buildProc2;
    }

    console.log("Starting bots");
    let bot1proc, bot2proc;
    if (bot1 === "HUMAN") {
      console.log("Bot 1 is a human player. Nothing needs to be started");
    } else if (!bot1Manifest.run) {
      console.log("mm.json is missing a run Script. Exiting");
      process.exit(1);
    } else {
      bot1proc = execa.command(bot1Manifest.run, {
        cwd: bot1,
        shell: true,
        all: true,
        env: { PORT: 2019 }
      });
      bot1proc.all.pipe(process.stdout);
      bot1IP = "http://localhost:2019/";
    }
    if (bot2 === "HUMAN") {
      console.log("Bot 2 is a human player. Nothing needs to be started");
    } else if (!bot2Manifest.run) {
      console.log("mm.json is missing a run Script. Exiting");
      process.exit(1);
    } else {
      bot2proc = execa.command(bot2Manifest.run, {
        cwd: bot2,
        shell: true,
        all: true,
        env: { PORT: 2525 }
      });
      bot2proc.all.pipe(process.stdout);
      bot2IP = "http://localhost:2525/";
    }

    if (bot1 !== "HUMAN" || bot2 !== "HUMAN") {
      console.log(`Waiting ${wait}s for the bots to start`);
      await sleep(1000 * wait);
    }

    console.log("Simulating a match");
    // Assert tmpdir
    await mkdirp(TMP_DIR);
    // java -jar GameEngine.jar [gameId] [boardFile] [player1Name] [player2Name] [player1URL] [player2URL] STDOUT
    const proc = execa("java", [
      "-jar",
      path.join(MM_FILES_DIR, "GameEngine.jar"),
      "game",
      path.join(MM_FILES_DIR, "board.csv"),
      "Player 1 - KMG", // Kentucky Machinists Guild
      "Player 2 - NCD", // Neo-Chicago Defensive
      // MMDF - Midwestern Mechanized Defensive Force
      // "The Riggs" - bandits that stole mechs and use them to terrorize
      bot1IP,
      bot2IP,
      LOG_PATH
    ]);

    proc.stderr.pipe(process.stderr);
    await proc;

    console.log("Killing bots");
    bot1proc.kill();
    bot2proc.kill();

    //   // TODO: pipe stdout to a logfile (if --logfile)
    //   if (logfile) {
    //     await writeFile(logfile, stdout);
    //   }

    if (argv.visualizer) {
      console.log("Setting up visualizer");
      await visualize(LOG_PATH);
    }
  }
);
