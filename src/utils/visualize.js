const path = require("path");
const os = require("os");
const run = require("./run");
const appRoot = require("app-root-path");

const VISUALIZER_DIR = path.join(os.homedir(), ".mm", "visualizer");
const GAME_NAME = "MM_MacOS_PlayerSettings";

const getVisualizer = () => {
  switch (process.platform) {
    case "darwin":
      returnpath.join(VISUALIZER_DIR, "Contents", "MacOS", GAME_NAME);
      break;
    case "win32":
      return path.join(VISUALIZER_DIR, `${GAME_NAME}.exe`);
      break;
    case "linux":
      if (process.arch === "x64")
        return path.join(VISUALIZER_DIR, `${GAME_NAME}.x86_64`);
      return path.join(VISUALIZER_DIR, `${GAME_NAME}.x86_64`);
      break;
  }
};

module.exports = logFile => run(getVisualizer(), [logFile]);
module.exports.getVisualizer = getVisualizer;
