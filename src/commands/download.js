//
const path = require("path");
const chalk = require("chalk");
const execa = require("execa");
const fetch = require("node-fetch");
const os = require("os");
const fs = require("fs");
const tar = require("tar");
const { promisify } = require("util");
const rimraf = promisify(require("rimraf"));
const { getVisualizer } = require("../utils/visualize");

const handleErrors = require("../utils/handleErrors");

const visualizerDir = path.join(os.homedir(), ".mm", "visualizer");

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const chmod = promisify(fs.chmod);

module.exports.command = "download";
module.exports.describe =
  "Download the appropriate visualizer for your operating system";

module.exports.builder = yargs => yargs;

module.exports.handler = handleErrors(async argv => {
  try {
    await rimraf(visualizerDir);
  } catch (e) {}
  try {
    await mkdir(visualizerDir);
  } catch (e) {}

  const extractor = tar
    .x({
      strip: 1,
      C: visualizerDir
    })
    .on("close", async () => {
      if (process.platform === "darwin" || process.platform === "linux") {
        await chmod(getVisualizer(), 0o755);
      }
      console.log("The game is downloaded");
    });

  if (process.platform === "darwin") {
    console.log("Downloading the game");
    fetch("https://mm-mac2.now.sh").then(res => res.body.pipe(extractor));
  }

  if (process.platform === "win32" || process.platform === "win64") {
    console.log("Downloading the game");
    fetch("https://mm-windows2.now.sh").then(res => res.body.pipe(extractor));
  }

  if (process.platform === "linux") {
    console.log("Downloading the game");
    fetch("https://mm-linux2.now.sh").then(res => res.body.pipe(extractor));
  }
});
