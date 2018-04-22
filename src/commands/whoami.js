// @flow
const path = require('path')
const chalk = require('chalk');

const { getTeam } = require('../utils/auth')
const handleErrors = require('../utils/handleErrors')

module.exports.command = 'whoami'
module.exports.describe = 'Get your team name and login token'

module.exports.builder = (yargs: any) => yargs

module.exports.handler = handleErrors(async (argv: {}) => {
  const team = await getTeam();

  if(!team) {
    return console.log('Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team.')
  }
  console.log(`Team ${chalk.red(team.name)}`);
  console.log(`To have more people join your team, tell them to run \`mm login ${chalk.blue(team.token)}\``);
})