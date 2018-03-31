// @flow
const path = require('path')

const { register } = require('../utils/auth')
const readline = require('readline')
const { promisify } = require('util')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const cmdQuestion = q => new Promise(r => rl.question(q, r));

module.exports.command = 'register'
module.exports.describe = 'Create a new team'

module.exports.builder = (yargs: any) => yargs
  .positional('passphrase', {
    type: 'string',
    describe: 'Your team\s generated passphrase'
  })

module.exports.handler = async (argv: {}) => {
  // TODO: Interactively ask for email and team name
  const name = await cmdQuestion('Team Name: ')
  const email = await cmdQuestion('Email: ')

  const team = await register(name, email)

  if(!team) {
    console.log('Failed to register - Team may already exist')
  } else {
    console.log('Registered in as %s and your token is %s', team.name, team.token)
  }

  console.log('Ask your friends to run `mm login ${token}` to join')
  rl.close()
}
