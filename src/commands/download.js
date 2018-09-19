//
const path = require("path");
const chalk = require("chalk");
const execa = require("execa");
const os = require('os');
const fs = require('fs')
const { promisify } = require('util')   

const { getTeam } = require("../utils/auth");
const handleErrors = require("../utils/handleErrors");

const fileName = "visualizer.tar.gz"
const visualizerPath = path.join(os.homedir(), '.mm/visualizer/')

const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)

module.exports.command = "download";
module.exports.describe =
  "Download the appropriate visualizer for your operating system";

module.exports.builder = yargs => yargs;

module.exports.handler = handleErrors(async argv => {
  const team = await getTeam();

  if (!team) {
    return console.log(
      "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
    );
  }
  if (process.platform === "darwin") {
    console.log("Starting download for the visualizer for mac");
    try {
      await stat(visualizerPath);
    } catch(e) {
      await mkdir(visualizerPath)
    }
    await execa('curl', ["-o", visualizerPath + "visualizer.tar.gz", "-ssL", 'mm-mac.now.sh']);
    await execa('tar',['xvzf', visualizerPath + "visualizer.tar.gz","-C", visualizerPath]);
    console.log("Successfully downloaded visualizer");
  } else if (process.platform === "win32" || process.platform === "win64") {
    console.log("Starting download for the visualizer for Windows");
    try {
      await stat(visualizerPath);
    } catch(e) {
      await mkdir(visualizerPath)
    }
    await execa('curl', ["-o", visualizerPath + "visualizer.tar.gz", "-ssL", 'mm-window.now.sh']);
    await execa('tar',['xvzf', visualizerPath + "visualizer.tar.gz","-C", visualizerPath]);
    console.log("Successfully downloaded visualizer");
  } else if (process.platform === "linux") {
    console.log("Starting download for the visualizer for Linux");
    try {
      await stat(visualizerPath);
    } catch(e) {
      await mkdir(visualizerPath)
    }
    await execa('curl', ["-o", visualizerPath + "visualizer.tar.gz", "-ssL", 'mm-linux.now.sh']);
    await execa('tar',['xvzf', visualizerPath + "visualizer.tar.gz","-C", visualizerPath]);
    console.log("Successfully downloaded visualizer");
  } else {
    console.log("Your operating system is not supported");
  }
});
