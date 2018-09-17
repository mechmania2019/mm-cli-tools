// @flow
const path = require("path");
const execa = require("execa");

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
  (argv: { script: string, noVisualizer: ?boolean, logfile: ?string }) => {
    const script = path.resolve(argv.script);
    console.log("Playing game with %s", script);

    // Build an image with the script
    const { stdout } = execa("docker", [
      "build",
      script,
      "-t",
      "mechmania.io/bot/1",
      "-t",
      "mechmania.io/bot/2"
    ]);
    // TODO: build a second image if provided
    // TODO: Start visualizer (unless --no-visualizer)
    stdout.pipe(process.stdout);
    stdout.on("close", async () => {
      console.log("Built image");
      console.log("Starting Game against your own bot");
      const { stdout, stderr } = execa("docker", [
        "run",
        "-v",
        "/var/run/docker.sock:/var/run/docker.sock",
        "--rm",
        "-i",
        "pranaygp/mm"
      ]);
      // TODO: pipe stdout from game engine to visualzer (unless --no-visualizer) and logfile (if --logfile)
      stderr.pipe(process.stderr);
      stdout.pipe(process.stdout);
    });
  }
);
