// @flow

const pkg = require('../../package');

const getLocalVersion = () => pkg.version

module.exports = {
  getLocalVersion
}