// @flow

const fs = require("fs");
const util = require("util");

const pkg = require("../../package");
const config = require("./config");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const getLocalVersion = () => pkg.version;
const getGameVersion = async () => readFile(config("VERSION"), "utf8");
const setGameVersion = async v => writeFile(config("VERSION"), v);

module.exports = {
  getLocalVersion,
  getGameVersion,
  setGameVersion
};
