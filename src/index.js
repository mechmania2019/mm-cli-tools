#!/usr/bin/env node
//@flow

const path = require('path');

const yargs = require('yargs');
const update = require('./commands/update');

const argv = yargs
  .usage(`usage: mm <command>`)
  .command('update', 'Update the game files (including this tool)', {
    dir: {
      default: path.resolve(process.cwd())
    }
  }, update)
  .help('help')
  .alias('h', 'help')
  .updateStrings({
    'index.js': 'mm'
  })
  .argv;

  checkCommands(yargs, argv, 1)

  function checkCommands (yargs, argv, numRequired) {
    if (argv._.length < numRequired) {
      yargs.showHelp()
    } else {
      // TODO: check for unknown command
    }
  }