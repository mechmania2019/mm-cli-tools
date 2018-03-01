// @flow

const config = require('./config')
const fs = require('fs')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const authFile = config('auth')

const isLoggedIn = async () => (await readFile(authFile, 'utf8')).length > 0
const getToken = async () => await readFile(authFile, 'utf8')
const setToken = async (token) => await writeFile(authFile, token)

module.exports = {
  isLoggedIn,
  getToken,
  setToken
}