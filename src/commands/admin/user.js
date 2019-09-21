const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");

const result = require("../../utils/result");
const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const { stats, teams, versions, matches } = require("../../api");

module.exports.command = "user";
module.exports.describe = false;

module.exports.builder = yargs => yargs;

module.exports.handler = handleErrors(async argv => {
  const team = await getTeam();

  if (!team) {
    return console.log(
      "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
    );
  }
  const users = await teams(team);

  const choices = users.map(user => ({
    name: user.name,
    value: user
  }));

  const { chosenTeam } = await inquirer.prompt([
    {
      type: "list",
      name: "chosenTeam",
      choices
    }
  ]);

  const allUserVersions = await versions(chosenTeam);

  const versionIds = []

  for (let i = 0; i < allUserVersions.length; i++) {
    versionIds.push(allUserVersions[i].key);
  }

  const modes = ["info", "versions", "matches"];

  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      choices: modes
    }
  ]);

  switch (mode) {
    case "info":
      console.log(`Name: ${chosenTeam.name}`);
      console.log(`Email: ${chosenTeam.email}`);
      console.log(`Token: ${chosenTeam.token}`);
      console.log(`Most recent push: ${chosenTeam.mostRecentPush.key}`);
      console.log(`Latest working script: ${chosenTeam.latestScript.key}`);
      break;


    case "versions":
      if (allUserVersions.length === 0) {
        console.log("This team has not pushed any scripts");
      } else {
        for (let i = 0; i < allUserVersions.length; i++) {
          console.log(allUserVersions[i].key);
        }
        const chosenVersion = await inquirer.prompt([
          {
            type: "list",
            name: "version",
            choices: versionIds
          }
        ]);
        const script = await fetch(`https://mechmania2019.s3.amazonaws.com/scripts/${chosenVersion.version}`);
        const fileStream = fs.createWriteStream(require('path').join(require('os').homedir(), 'Desktop'));
        await new promise((resolve,reject) =>{
          res.body.pipe(fileStream);
          res.body.on("error",(err)=>{
            reject(err);
          });
          fileStream.on("finish",function(){
            resolve();
          });
        });
      }
      break;


    case "matches":
      if (allUserVersions.length === 0) {
        "This user has not pushed any scripts check back later.";
      } else {
        const chosenVersion = await inquirer.prompt([
          {
            type: "list",
            name: "version",
            choices: versionIds
          }
        ]);
        const allMatches = await matches(chosenTeam, chosenVersion.version);

        let wins = 0;
        let losses = 0;
        let ties = 0;

        for (let i = 0; i < allMatches.length; i++) {
          if (allMatches[i].result === 'win') {
            wins++;
          } else if (allMatches[i].result === 'loss') {
            losses++;
          } else {
            ties++;
          }
          console.log(`${allMatches[i].opponent.toString().padEnd(30, " ")} ${result(allMatches[i].result)}`);
        }
        
        console.log(
          `${chalk.green(`Total Wins: ${wins}`)}, ${chalk.red(`Total Losses: ${losses}`)}, ${chalk.blue(`Total Ties: ${ties}`)}`
        );

      }
      break;


    default:
      console.log("You broke the cli tool, congrats. Please report this");
  }
});
