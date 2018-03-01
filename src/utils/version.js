// @flow

const config = require('./config')
const fs = require('fs')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const versionFile = config('VERSION')

const getLocalVersion = async () => await readFile(versionFile, 'utf8')
const setLocalVersion = async (version: string) => await writeFile(versionFile, version)

module.exports = {
  getLocalVersion,
  setLocalVersion
}