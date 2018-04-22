// @flow

const config = require('./config')
const fs = require('fs')
const { promisify } = require('util')

const { login: serverLogin, register: serverRegister } = require('../api')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const authFile = config('auth')

export type Team = {
  _id: string, 
  name: string,
  latestScript: ?string,
  admin: ?boolean,
  token: string
}

const login = async (token: string): Promise<?Team> => {
  const user = await serverLogin(token)
  await writeFile(authFile, JSON.stringify(user))
  return user;
}

const logout = async (): Promise<void> => {
  await writeFile(authFile, '{}');
}

const getTeam = async (): Promise<?Team> => {
  const data: string = await readFile(authFile, 'utf8')
  const team = JSON.parse(data)
  return team
}
const register = async (name : string, email: string): Promise<?Team> => {
  const user = await serverRegister(name, email)
  await writeFile(authFile, JSON.stringify(user))
  return user
}

module.exports = {  
  login,
  logout,
  getTeam,
  register
}