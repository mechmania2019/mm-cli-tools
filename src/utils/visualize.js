const path = require("path");
const os = require("os");
const run = require("./run");
const appRoot = require("app-root-path");

const VISUALIZER_DIR = path.join(os.homedir(), ".mm", "visualizer");
const GAME_NAME = os => (os === "Windows" && `MM2018`) || `MM_${os}_After5`;

const getVisualizer = () => {
  switch (process.platform) {
    case "darwin":
      return path.join(VISUALIZER_DIR, "Contents", "MacOS", GAME_NAME("MacOS"));
      break;
    case "win32":
    case "win64":
      return path.join(VISUALIZER_DIR, `${GAME_NAME("Windows")}.exe`);
      break;
    case "linux":
      if (process.arch === "x64")
        return path.join(
          VISUALIZER_DIR,
          `${GAME_NAME("LinuxCombined")}.x86_64`
        );
      return path.join(VISUALIZER_DIR, `${GAME_NAME("LinuxCombined")}.x86_64`);
      break;
  }
};

module.exports = logFile => run(getVisualizer(), [logFile]);
module.exports.getVisualizer = getVisualizer;
