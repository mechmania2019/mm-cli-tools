const execa = require("execa");
const getStream = require("get-stream");

module.exports = async (...args) => {
  const proc = execa(...args);
  const { stdout, stderr } = proc;
  let code, signal;
  proc.on("exit", (c, s) => ((code = c), (signal = s)));
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
  return {
    stdout: await getStream(stdout),
    stderr: await getStream(stderr),
    code,
    signal
  };
};
