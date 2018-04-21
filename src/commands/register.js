// @flow
const path = require('path')

const { register } = require('../utils/auth')
const { promisify } = require('util')
const { rl, cmdQuestion } = require('../utils/prompt')

module.exports.command = 'register'
module.exports.describe = 'Create a new team'

module.exports.builder = (yargs: any) => yargs
  .positional('passphrase', {
    type: 'string',
    describe: 'Your team\s generated passphrase'
  })

module.exports.handler = async (argv: {}) => {
  // prompt Team name and Email
  const name = await cmdQuestion('Team Name: ')
  const email = await cmdQuestion('Email: ')

  const team = await register(name, email);

  if(!team) {
    console.log('Failed to register - Team may already exist')
  } else {
    console.log('Registered in as %s', team.name)
    console.log(`Ask your friends to run \`mm login ${team.token}\` to join`)
  }

  rl.close()
}
