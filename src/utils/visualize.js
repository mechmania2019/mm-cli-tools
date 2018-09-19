const path = require("path");
const os = require("os");
const run = require("./run");
const appRoot = require("app-root-path");

const VISUALIZER_DIR = path.join(os.homedir(), ".mm", "visualizer");
const GAME_NAME = "MM_MacOS_PlayerSettings";

module.exports = logFile => {
  let commandToRun;
  switch (process.platform) {
    case "darwin":
      commandToRun = path.join(
        VISUALIZER_DIR,
        "Contents",
        "MacOS",
        GAME_NAME
      );
      break;
    case "win32":
      commandToRun = path.join(VISUALIZER_DIR, `${GAME_NAME}.exe`);
      break;
    case "linux":
      if (process.arch === "x64")
        commandToRun = path.join(VISUALIZER_DIR, `${GAME_NAME}.x86_64`);
      commandToRun = path.join(VISUALIZER_DIR, `${GAME_NAME}.x86_64`);
      break;
  }
  // TODO: supply { cwd: VISUALIZER_DIR } as opts if needed (for win/linux deps)
  return run(commandToRun, [logFile]);
};
