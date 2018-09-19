//
const path = require("path");
const chalk = require("chalk");
const execa = require("execa");

const { getTeam } = require("../utils/auth");
const handleErrors = require("../utils/handleErrors");

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
    await execa('curl', ["-o", "mac.zip", 'mm-mac.now.sh']);
    console.log("Downloading the visualizer for mac");
  } else if (process.platform === "win32" || process.platform === "win64") {
    await execa('curl', ["-o", "mac.zip", 'mm-windows.now.sh']);
    console.log("Downloading the visualizer for Windows 32");
  } else if (process.platform === "linux") {
    await execa('curl', ["-o", "mac.zip", 'mm-linux.now.sh']);
    console.log("Downloading the visualizer for Windows 64");
  } else {
    console.log("Your operating system is not supported");
  }
  console.log(`Team ${chalk.red(team.name)}`);
});
