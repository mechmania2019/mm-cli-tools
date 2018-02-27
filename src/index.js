#!/usr/bin/env node
//@flow
const yargs = require('yargs');

const argv = yargs
  .commandDir('./commands')
  .help('help')
  .alias('h', 'help')
  .argv;

  // checkCommands(yargs, argv, 1)

  // function checkCommands (yargs, argv, numRequired) {
  //   if (argv._.length < numRequired) {
  //     yargs.showHelp()
  //   } else {
  //     // TODO: check for unknown command
  //   }
  // }