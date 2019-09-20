const path = require("path");
const os = require("os");
const run = require("./run");
const appRoot = require("app-root-path");

const MM_FILES_DIR = path.join(os.homedir(), ".mm", "files");
const VISUALIZER_DIR = path.join(MM_FILES_DIR, "visualizer");
const GAME_NAME = `MM2018`;

const getVisualizer = () => {
  switch (process.platform) {
    case "darwin":
      return path.join(
        VISUALIZER_DIR,
        "Mac",
        "Mac.app",
        "Contents",
        "MacOS",
        "Mac"
      );
      break;
    case "win32":
    case "win64":
      return path.join(VISUALIZER_DIR, "Windows", `MM25.exe`);
      break;
    case "linux":
      if (process.arch === "x64")
        return path.join(VISUALIZER_DIR, `${GAME_NAME}.x86_64`);
      return path.join(VISUALIZER_DIR, `${GAME_NAME}.x86`);
      break;
  }
};

module.exports = logFile =>
  run(getVisualizer(), ["--data", logFile], { shell: true });
module.exports.getVisualizer = getVisualizer;
