// @flow
const path = require('path')

module.exports.command = 'login [team-name] [password]'
module.exports.describe = 'Login to your team\'s account'

module.exports.builder = (yargs: any) => yargs
  .positional('team-name', {
    type: 'string',
    describe: 'Team name'
  })
  .positional('password', {
    type: 'string',
    describe: 'Team password'
  })

module.exports.handler = (argv: any) => {
  let teamName = argv.teamName;
  let password = argv.password;

  if(!teamName) {
    // TODO: Prompt for team name
  }
  if(!password) {
    // TODO: Prompt for password
  }

  // TODO: Make request to login microservice
  // TODO: Show error if request says invalid user/credentials
  // TODO: Save token to local file

  console.log('Logged in %s', teamName)
}