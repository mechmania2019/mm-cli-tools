// @flow
const path = require("path");
const run = require("../utils/run");

const handleErrors = require("../utils/handleErrors");

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
    await run("docker", ["pull", "pranaygp/mm"]);

    console.log("Building your bot at %s", script);
    // TODO: Don't use docker (only support python/c perhaps?) if --no-docker
    await run("docker", [
      "build",
      script,
      "-t",
      "mechmania.io/bot/1",
      "-t",
      "mechmania.io/bot/2"
    ]);

    console.log("Running game against your own bot");
    await run("docker", [
      "run",
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      "--rm",
      "-i",
      "pranaygp/mm"
    ]);
    // TODO: pipe stdout from game engine to a file (unless --no-visualizer) and logfile (if --logfile)
    // TODO: Start visualizer (unless --no-visualizer) with logfile location as arg
  }
);
