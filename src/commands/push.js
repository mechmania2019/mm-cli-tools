// @flow
const path = require('path')

module.exports.command = 'push <script>'
module.exports.describe = 'Push your script to the mechmania servers to generate stats and replays against other teams'

module.exports.builder = (yargs: any) => yargs
  .positional('script', {
    type: 'string',
    describe: 'Path to your bot\'s script'
  })

module.exports.handler = (argv: any) => {
  const script = path.resolve(argv.script)

  // TODO: Check if the server already has the script (SHA 256 hash)
  // TODO: If not, Check if file exists, and create readable stream else error out
  // TODO: Pipe the file stream into a request to the server 
  // TODO: Display progress of upliad to stdout

  console.log('Pushing script at %s to the mechmania server', script)
}