// @flow
const { promisify } = require("util");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mkdirp = promisify(require("mkdirp"));

const run = require("../utils/run");
const visualize = require("../utils/visualize");
const handleErrors = require("../utils/handleErrors");

const TMP_DIR = path.join(os.tmpdir(), "mm");
const LOG_PATH = path.join(TMP_DIR, "last.log.txt");

const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const stat = promisify(fs.stat);

module.exports.command = ["$0 <script>", "play <script>"];
module.exports.describe =
  "Watch your bot play against the default AI bot. To see other possible commands, run `mm help`";

module.exports.builder = (yargs: any) =>
  yargs
    .positional("script", {
      type: "string",
      describe: "Path to your bot's script"
    })
    .option("no-visualizer", {
      type: "boolean",
      describe:
        "Just build and save the logfile without starting the visualizer"
    })
    .option("logfile", {
      type: "string",
      describe:
        "Provide a path to a logfile to write the results of the game engine into (the file can be used as the input to the visualizer"
    });

module.exports.handler = handleErrors(
  async (argv: {
    script: string,
    noVisualizer: ?boolean,
    logfile: ?string
  }) => {
    const script = path.resolve(argv.script);
    if (!argv.noVisualizer) {
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
      const stats = await stat(script);
      if (!stats.isDirectory()) {
        console.error(
          `${script} is not a directory. Make sure to run mm play on a directory, not a file.`
        );
        process.exit(1);
      }
    } catch (e) {
      console.error(
        `Error accesssing the directory ${script}. Are you sure it exists and you permissions to access it`
      );
      process.exit(1);
    }

    console.log("Updating game binary");
    const { code: updateCode } = await run("docker", ["pull", "pranaygp/mm"]);
    if (updateCode && updateCode !== 0) {
      console.error("Error updating the game binary");
      process.exit(updateCode);
    }

    console.log("Building your bot at %s", script);
    const { code: buildCode } = await run("docker", [
      "build",
      script,
      "-t",
      "mechmania.io/bot/1",
      "-t",
      "mechmania.io/bot/2"
    ]);
    if (buildCode && buildCode !== 0) {
      console.error("Error building your bot");
      process.exit(buildCode);
    }
    // TODO: build the second bot if provided

    console.log("Running game against your own bot");
    const { stdout, code: runCode } = await run("docker", [
      "run",
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      "--rm",
      "-i",
      "pranaygp/mm"
    ]);
    if (runCode && runCode !== 0) {
      console.error("Error running the game");
      process.exit(runCode);
    }
    // TODO: pipe stdout from game engine to a logfile (if --logfile)

    if (!argv.noVisualizer) {
      console.log("Setting up visualizer");
      // Assert tmpdir
      await mkdirp(TMP_DIR);
      await writeFile(LOG_PATH, stdout);
      await visualize(LOG_PATH);
    }
  }
);
