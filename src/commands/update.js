// @flow
const path = require('path')

module.exports.command = 'update [dir]'
module.exports.describe = 'Update the game files'

module.exports.builder = (yargs: any) => yargs
  .positional('dir', {
    type: 'string',
    describe: 'Path to your game files',
    default: process.cwd()
  })
  .option('force', {
    type: 'boolean',
    alias: 'f',
    describe: 'Skip version match check'
  })

module.exports.handler = (argv: any) => {
  const dir = path.resolve(argv.dir)
  // TODO: Get local game files version (how?)
  // TODO: Check if server version matches the local game files version (skip if force)
  // TODO: Download tar from server into tmp
  // TODO: extract files into dir
  // TODO: reinstall CLI tools from downloaded package
  console.log('Updated the mechmania project to the latest version at %s', dir)
}