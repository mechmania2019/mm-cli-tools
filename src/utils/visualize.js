const path = require("path");
const os = require("os");
const run = require("./run");
const appRoot = require("app-root-path");

const VISUALIZER_DIR = path.join(os.homedir(), ".mm", "visualizer");
const GAME_NAME = `MM2018`;

const getVisualizer = () => {
  switch (process.platform) {
    case "darwin":
      return path.join(VISUALIZER_DIR, "Contents", "MacOS", GAME_NAME);
      break;
    case "win32":
    case "win64":
      return path.join(VISUALIZER_DIR, `${GAME_NAME}.exe`);
      break;
    case "linux":
      if (process.arch === "x64")
        return path.join(
          VISUALIZER_DIR,
          `${GAME_NAME}.x86_64`
        );
      return path.join(VISUALIZER_DIR, `${GAME_NAME}.x86`);
      break;
  }
};

module.exports = (logFile, p1, p2) => run(getVisualizer(), [logFile, p1 || "Player 1", p2 || "Player 2"]);
module.exports.getVisualizer = getVisualizer;
