#!/usr/bin/env node
//@flow
const yargs = require('yargs');

const config = require('./utils/config');
const { getLocalVersion } = require('./utils/version');

(async () => {
  await config.setup()
  const argv = yargs
    .commandDir('./commands')
    .help('help')
    .alias('h', 'help')
    .alias('v', 'version')
    .version(await getLocalVersion())
    .argv;
})()