// @flow
const path = require('path')
const chalk = require('chalk');

const { getTeam } = require('../utils/auth')
const handleErrors = require('../utils/handleErrors')

const { log } = require("../api");

module.exports.command = 'log'
module.exports.describe = 'Get the logs from compiling your script'

module.exports.builder = (yargs: any) => yargs

module.exports.handler = handleErrors(async (argv: {}) => {
  const team = await getTeam();

  if(!team) {
    return console.log('Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team.')
  }
//   console.log(`Team ${chalk.red(team.name)}`);
  console.log("Getting the compiler logs for your latest script");

  const pushPromise = log(team);
  const response = await pushPromise;
  console.log(response)
})

