exports.command = 'admin <command>'
exports.desc = false
exports.builder = function (yargs) {
  return yargs.commandDir('admin')
}
exports.handler = function (argv) {}