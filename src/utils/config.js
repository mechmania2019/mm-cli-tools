// @flow

const os = require('os');
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const stat = promisify(fs.stat)
const mkdir = promisify(fs.mkdir)
const writeFile = promisify(fs.writeFile)

const mmPath = path.join(os.homedir(), '.mm/')
const config = (file: ?string): string => path.join(mmPath, file || '')

const setup = async () => {
  try {
    await stat(config());
  } catch(e) {
    await mkdir(config())
  }
  try {
    await stat(config('VERSION'));
  } catch(e) {
    await writeFile(config('VERSION'), '0.0.0')
  }
  try {
    await stat(config('auth'));
  } catch(e) {
    await writeFile(config('auth'), '')
  }
}

config.setup = setup
module.exports = config