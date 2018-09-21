//      
const path = require('path')
const chalk = require('chalk');
const fetch = require('node-fetch');
const { getTeam } = require('../utils/auth')
const handleErrors = require('../utils/handleErrors')

const { stats, teams } = require("../api");

module.exports.command = 'rankings'
module.exports.describe = 'Gets the rankings by displaying all the teams and the win and loss rate for every team'

module.exports.builder = (yargs     ) => yargs



function sortUsers(a, b) {
  return ( a.stats.wins / (a.stats.wins + a.stats.losses + a.stats.ties)) <  ( b.stats.wins / (b.stats.wins + b.stats.losses + b.stats.ties)) ? 1 : -1;
}

module.exports.handler = handleErrors(async (argv ) => {
  const team = await getTeam();

  if(!team) {
    return console.log('Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team.')
  }
  if (!team.admin) {
    return console.log('You are not an admin')
  }

  const users = await teams();
  let scripts = await Promise.all(
    users.map(user => stats(user["team"], user["script"].key))
  );

  var zipped = users.map(function(user, i) {
    return {
      "team": user.team.name,
      "stats": scripts[i]
    }
  });

  const sortedTeams = zipped.sort(sortUsers);1

  sortedTeams.map(user => {
    let wins = user.stats.wins;
    let losses = user.stats.losses;
    let ties = user.stats.ties;
    console.log(`
    Team: ${user.team.padEnd(20).substring(0,20)} Winning Percent: ${parseInt(100 * ( user.stats.wins / (user.stats.wins + user.stats.losses + user.stats.ties)))} Wins: ${wins} Losses: ${losses} Ties: ${ties} `)

  }
  
  )



})