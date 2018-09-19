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
    console.log("Updating game binary");
    const { code: updateCode } = await run("docker", ["pull", "pranaygp/mm"]);
    if (updateCode && updateCode !== 0) {
      console.error("Error updating the game binary");
      process.exit(updateCode);
    }

    console.log("Building your bot at %s", script);
    // TODO: Don't use docker (only support python/c perhaps?) if --no-docker
    const { code: buildCode } = await run("docker", [
      "build",
      script,
      "-t",
      "mechmania.io/bot/1",
      "-t",
      "mechmania.io/bot/2"
    ]);
    if (buildCode && buildCode !== 0) {
      console.error("Error updating the game binary");
      process.exit(buildCode);
    }

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
      console.error("Error updating the game binary");
      process.exit(runCode);
    }

    console.log("Setting up visualizer");
    // Assert tmpdir
    await mkdirp(TMP_DIR);
    await writeFile(LOG_PATH, stdout);
    await visualize(LOG_PATH);
    // TODO: pipe stdout from game engine to a file (unless --no-visualizer) and logfile (if --logfile)
  }
);
