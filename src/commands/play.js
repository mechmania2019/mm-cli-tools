// @flow
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mkdirp = promisify(require("mkdirp"));
const chalk = require("chalk");
const tar = require("tar");
const execa = require("execa");

const { play } = require("../api");
const run = require("../utils/run");
const visualize = require("../utils/visualize");
const handleErrors = require("../utils/handleErrors");

const TMP_DIR = path.join(os.tmpdir(), "mm");
const LOG_PATH = path.join(TMP_DIR, "last.log.txt");

const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const stat = promisify(fs.stat);

const build = async (s1, s2) => {
  if (!s2) {
    console.log("Building your bot at %s", s1);
    const { code } = await run("docker", [
      "build",
      s1,
      "-t",
      "mechmania.io/bot/1",
      "-t",
      "mechmania.io/bot/2"
    ]);
    if (code && code !== 0) {
      console.error("Error building your bot");
      process.exit(code);
    }
  } else {
    await Promise.all(
      [s1, s2].map(async (s, i) => {
        console.log("Building your bot at %s", s);
        const { code } = await run("docker", [
          "build",
          s,
          "-t",
          `mechmania.io/bot/${i + 1}`
        ]);
        if (code && code !== 0) {
          console.error("Error building your bot");
          process.exit(code);
        }
      })
    );
  }
};

module.exports.command = "play <script> [script2]";
module.exports.describe =
  "Watch your bot play against itself (or another bot). To see other possible commands, run `mm help`";

module.exports.builder = (yargs: any) =>
  yargs
    .positional("script", {
      type: "string",
      describe: "Path to your bot's script"
    })
    .positional("script2", {
      type: "string",
      describe: "Second bot to play against"
    })
    .option("remote", {
      type: "boolean",
      describe: "EXPERIMENTAL: Build and test your bot in the cloud!"
    })
    .option("visualizer", {
      type: "boolean",
      default: true,
      describe:
        "Start the visualizer after the game engine is done processing the game"
    })
    .option("logfile", {
      type: "string",
      describe:
        "Provide a path to a logfile to write the results of the game engine into (the file can be used as the input to the visualizer)"
    })
    .option("timeout", {
      type: "number",
      describe:
        "On slower PCs, increase this number. Your bot will be given x seconds to start up",
      default: 3
    });

module.exports.handler = handleErrors(
  async (argv: {
    script: string,
    script2: ?string,
    visualizer: ?boolean,
    remote: ?boolean,
    logfile: ?string,
    timeout: number
  }) => {
    const script1 = path.resolve(argv.script);
    const script2 = argv.script2 && path.resolve(argv.script2);
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

    try {
      const stats = await stat(script1);
      if (!stats.isDirectory()) {
        console.error(
          `${script1} is not a directory. Make sure to run mm play on a directory, not a file.`
        );
        process.exit(1);
      }
    } catch (e) {
      console.error(
        `Error accesssing the directory ${script1}. Are you sure it exists and you permissions to access it`
      );
      process.exit(1);
    }

    let stdout;
    if (argv.remote) {
      console.log(
        chalk.yellow(
          `NOTE: Cloud builds with --remote are an experimental feature`
        )
      );
      if (script2) {
        console.log(
          chalk.red(
            `ERROR: Cloud builds don't support passing in 2 bots. You may only test a bot against itself.`
          )
        );
        process.exit(1);
      }
      console.log("This could take a while...");
      stdout = await play(tar.c({ gzip: true, cwd: script1 }, ["."]));
    } else {
      console.log("Updating game binary");
      const { code: updateCode } = await run("docker", ["pull", "pranaygp/mm"]);
      if (updateCode && updateCode !== 0) {
        console.error("Error updating the game binary");
        process.exit(updateCode);
      }

      console.log("Building your bot(s)");
      await build(script1, script2);

      console.log("Running the game engine (only logs using the `log` function will be visible during this)");
      const proc = execa("docker", [
        "run",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "--rm",
        "-i",
        "-e",
        `TIMEOUT=${argv.timeout}`,
        "pranaygp/mm"
      ]);
      proc.stderr && proc.stderr.pipe(process.stderr);
      stdout = (await proc).stdout;
    }

    // TODO: pipe stdout to a logfile (if --logfile)

    if (argv.visualizer) {
      console.log("Setting up visualizer");
      // Assert tmpdir
      await mkdirp(TMP_DIR);
      await writeFile(LOG_PATH, stdout);
      await visualize(LOG_PATH);
    }
  }
);
