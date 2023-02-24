/*
This script analyses PRs to figure out which organization created them.

It takes one argument:
- a relative path to a JSON file containing the reviews to analyse (prs.json). This is probably the output of a previous call to query-prs.js

It filters PRs to consider only those merged in 2022, and then lists every contributor who authored at least one PR, along with the number of PRs that they authored. It gives its output in CSV format.

node analyse-prs.js PATH/TO/PRS.JSON
*/

const fs = require("fs");

const prsFile = process.argv[2];

function getCommitters(json) {
  const year = "2022";
  const prs = json.filter((pr) => pr.merged_at !== null);
  const committers = {};

  for (const pr of prs) {
    const prefix = pr.merged_at.slice(0, 4);
    if (prefix !== year) continue;
    if (committers[pr.user.login]) {
      committers[pr.user.login]++;
    } else {
      committers[pr.user.login] = 1;
    }
  }

  return committers;
}

function logCommitters(committers) {
  const committerNames = Object.keys(committers);
  for (committer of committerNames) {
    console.log(`${committer}, ${committers[committer]} `);
  }
}

const prJSON = fs.readFileSync(prsFile, "utf8");
const prs = JSON.parse(prJSON);

const committers = getCommitters(prs);
logCommitters(committers);
