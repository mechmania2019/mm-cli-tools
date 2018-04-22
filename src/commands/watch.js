// @flow

const handleErrors = require('../utils/handleErrors')

module.exports.command = 'watch <team> [team2]'
module.exports.describe = 'Watch the latest match your bot played against another team'

module.exports.builder = (yargs: any) => yargs
  .positional('team', {
    type: 'string',
    describe: 'Name of team to watch a match against',
  })
  .positional('team2', {
    type: 'string',
    describe: 'Name of team to match against team 1',
    default: 'me'  //TODO: get self teamID
  })

module.exports.handler = handleErrors((argv: {team: string, team2: string}) => {
  const team1 = argv.team
  const team2 = argv.team2
  // TODO: Fetch logfile from server
  // TODO: Handle errors from server (no logfile found?)
  // TODO: Store logfile in tmp/ folder
  // TODO: Start visualizer on logfile

  console.log('%s vs. %s', team1, team2)
});
