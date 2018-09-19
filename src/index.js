#!/usr/bin/env node
//@flow
const yargs = require('yargs');
const pkg = require('../package');
const checkForUpdate = require('update-check');

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
    console.log(`The latest version is ${update.latest}. Please update!`);
  }
  await config.setup()
  const argv = yargs
    .commandDir('./commands')
    .alias('h', 'help')
    .alias('v', 'version')
    .version(getLocalVersion())
    .argv;
})()