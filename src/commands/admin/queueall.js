const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");

const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const { stats, teams, versions, matches } = require("../../api");

module.exports.command = "queue-all";
module.exports.describe = false;

module.exports.builder = yargs => yargs;