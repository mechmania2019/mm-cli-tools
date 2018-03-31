// @flow
const path = require('path')

const { login } = require('../utils/auth')

module.exports.command = 'register [passphrase]'
module.exports.describe = 'Create a new team'

module.exports.builder = (yargs: any) => yargs  

module.exports.handler = async (argv: {}) => {
  // TODO: Interactively ask for email and team name
  console.log('Created team and logged in')
  console.log('Ask your friends to run `mm login ${token}` to join')
}