const chalk = require("chalk");
const { releases } = require("../api");
const { getGameVersion } = require("./version");

module.exports = async () => {
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
    process.exit(1);
  }
};
