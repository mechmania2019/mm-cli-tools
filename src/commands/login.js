// @flow
const path = require('path')

const { login } = require('../utils/auth')
const { rl, cmdQuestion } = require('../utils/prompt')

module.exports.command = 'login [passphrase]'
module.exports.describe = 'Login to your team\'s account'

module.exports.builder = (yargs: any) => yargs
  .positional('passphrase', {
    type: 'string',
    describe: 'Your team\s generated passphrase'
  })

module.exports.handler = async (argv: { passphrase: string }) => {
  let token = argv.passphrase;

  if(!token) {
    // Prompt for passphrase
    token = await cmdQuestion('Enter passphrase: ')
  }

  const team = await login(token)

  if(!team) {
    console.log('Failed to login')
  } else {
    console.log('Logged in as %s', team.name)
  }
  // TODO: save login status/token 

  rl.close()
}