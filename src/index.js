#!/usr/bin/env node
//@flow
const yargs = require('yargs');
const chalk = require('chalk')
const checkForUpdate = require('update-check');
const pkg = require('../package');

const config = require('./utils/config');
const { getLocalVersion } = require('./utils/version');

(async () => {
  let update = null;

  try {
    update = await checkForUpdate(pkg);
  } catch (err) {
    console.error(`Failed to check for updates: ${err}`);
  }

  if (update) {
    console.log(chalk.red(`
======================================================================

The latest version is ${update.latest}. Run \`${chalk.green(`npm install -g mechmania`)}\` to update

======================================================================
`));
  }
  await config.setup()
  const argv = yargs
    .commandDir('./commands')
    .alias('h', 'help')
    .alias('v', 'version')
    .version(getLocalVersion())
    .argv;
})()