// @flow
const path = require('path')

// var archiver = require('archiver');
// var archive = archiver('zip');
const file_system = require('fs');
const archiver = require('archiver');
const { push } = require('../api')

const { getTeam } = require('../utils/auth');
const handleErrors = require('../utils/handleErrors')

module.exports.command = 'push <script>'
module.exports.describe = 'Push your bot directory to the mechmania servers to generate stats and replays against other teams'

module.exports.builder = (yargs: any) => yargs
  .positional('script', {
    type: 'string',
    describe: 'Path to your bot\'s directory'
  })

module.exports.handler = handleErrors(async (argv: {script: string}) => {
  const script = path.resolve(argv.script)

  // TODO: Check if the server already has the script (SHA 256 hash)
  // TODO: If not, Check if file exists, and create readable stream else error out
  // TODO: Pipe the file stream into a request to the server 
  // TODO: Display progress of upliad to stdout
  console.log('Pushing script at %s to the mechmania server', script)

  const archive = archiver('zip');
  const team = await getTeam();
  const pushPromise = push(team, archive);
  archive.directory(script, '.', { date: new Date() });  
  archive.finalize();
  const response = await pushPromise;
  console.log(response);
})