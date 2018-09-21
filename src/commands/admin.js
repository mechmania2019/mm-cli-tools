exports.command = 'admin <command>'
exports.desc = 'Admin toolset'
exports.builder = function (yargs) {
  return yargs.commandDir('admin')
}
exports.handler = function (argv) {}