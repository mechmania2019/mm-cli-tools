const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const cmdQuestion = q => new Promise(r => rl.question(q, r))

module.exports = {
  cmdQuestion,
  rl
}
