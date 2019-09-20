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
const AdmZip = require("adm-zip");

const { releases } = require("../api");
const { setGameVersion } = require("../utils/version");
const handleErrors = require("../utils/handleErrors");

const mmFilesDir = path.join(os.homedir(), ".mm", "files");

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const chmod = promisify(fs.chmod);

module.exports.command = ["download", "update"];
module.exports.describe = "Download the game files for your operating system";

module.exports.builder = yargs => yargs;

const zipMap = {
  darwin: "Mac.zip",
  win32: "Windows.zip",
  win64: "Windows.zip",
  linux: "Linux.zip"
};

module.exports.handler = handleErrors(async argv => {
  console.log("Deleting old game files");
  try {
    await rimraf(mmFilesDir);
  } catch (e) {}
  try {
    await mkdir(mmFilesDir);
  } catch (e) {}

  console.log("Downloading game files");
  const manifest = await releases();
  await Promise.all(
    manifest.assets.map(
      asset =>
        new Promise(r => {
          if (
            asset.name.includes(".zip") &&
            asset.name !== zipMap[process.platform]
          ) {
            return r();
          }
          const url = asset.browser_download_url;
          const outputPath = path.join(mmFilesDir, asset.name);
          const output = fs.createWriteStream(outputPath);
          output.on("close", async () => {
            console.log(`Downloaded ${asset.name} to ${outputPath}`);
            r();
          });
          fetch(url).then(res => res.body.pipe(output));
        })
    )
  );
  console.log(
    `Successfully downloaded all game files for version ${chalk.green(
      manifest.tag_name
    )}`
  );
  console.log("Installing Visualizer");
  const zip = new AdmZip(path.join(mmFilesDir, zipMap[process.platform]));
  await zip.extractAllTo(path.join(mmFilesDir, "visualizer"), true);
  if (process.platform === "darwin" || process.platform === "linux") {
    await chmod(getVisualizer(), 0o755);
  }
  console.log("The game is ready!");
  await setGameVersion(manifest.tag_name);
});
