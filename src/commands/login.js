// @flow
const path = require('path')

const chalk = require('chalk');

const { login } = require('../utils/auth')
const { createRL, cmdQuestion } = require('../utils/prompt')

module.exports.command = 'login [passphrase]'
module.exports.describe = 'Login to your team\'s account'

module.exports.builder = (yargs: any) => yargs
  .positional('passphrase', {
    type: 'string',
    describe: 'Your team\s generated passphrase'
  })

module.exports.handler = async (argv: { passphrase: string }) => {
  let token = argv.passphrase;

  const close = createRL();

  if(!token) {
    // Prompt for passphrase
    token = await cmdQuestion('Enter passphrase: ')
  }

  const team = await login(token)

  if(!team) {
    console.log('Failed to login')
  } else {
    console.log('Logged in as %s', chalk.red(team.name))
  }
  // TODO: save login status/token 

  close()
}