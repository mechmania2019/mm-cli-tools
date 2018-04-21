const readline = require('readline')

let rl;
const createRL = () => {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return () => rl.close();
}

const cmdQuestion = q => {
  if(!rl) {
    return Promise.reject('You must run createRL first');
  }
  return new Promise(r => rl.question(q, r))
}

module.exports = {
  cmdQuestion,
  createRL
}
