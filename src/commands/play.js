// @flow
const path = require('path')

const handleErrors = require('../utils/handleErrors')

module.exports.command = ['$0 <script>', 'play <script>']
module.exports.describe = 'Watch your bot play against the default AI bot. To see other possible commands, run `mm help`'

module.exports.builder = (yargs: any) => yargs
  .positional('script', {
    type: 'string',
    describe: 'Path to your bot\'s script'
  })
  .option('no-visualizer', {
    type: 'boolean',
    describe: 'Just build and save the logfile without starting the visualizer',
  })
  .option('logfile', {
    type: 'string',
    describe: 'Provide a path to a logfile to write the results of the game engine into (the file can be used as the input to the visualizer',
  })

module.exports.handler = handleErrors((argv: {script: string, noVisualizer: ?boolean, logfile: ?string}) => {
  const script = path.resolve(argv.script)

  // TODO: Start game engine with the path to the script
  // TODO: Start visualizer (unless --no-visualizer)
  // TODO: pipe stdout from game engine to visualzer (unless --no-visualizer) and logfile (if --logfile)

  console.log('Playin game with %s', script)
})