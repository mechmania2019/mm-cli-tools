// @flow
const path = require('path')

const chalk = require('chalk');

const { logout } = require('../utils/auth')
const handleErrors = require('../utils/handleErrors')

module.exports.command = 'logout'
module.exports.describe = 'Logout of your team\'s account'

module.exports.builder = (yargs: any) => yargs

module.exports.handler =  handleErrors(async (argv: { passphrase: string }) => {
  await logout();
  console.log('Logged out');
})