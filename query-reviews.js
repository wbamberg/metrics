/*
This script fetches **all** reviews, except comment reviews, of PRs to mdn/content within the time period specified in the `months` constant.
It takes as arguments:

- your GitHub Personal Access Token
- a relative path to a JSON file containing the reviews to analyse (prs.json)

You could call it like:

node query-reviews.js MY-TOKEN PATH/TO/PRS.JSON > all-reviews.json

It first filters the prs.json file to include only those merged in the months listed in `months`. It then gets each PR listed and fetches all review for that PR. It excludes "comment" reviews.

Finally it writes out a stringified JSON array of all the reviews.

It is heavy on the HTTP requests, and can take a long time to run!
*/

const fs = require("fs");
const fetch = require("node-fetch");

const token = process.argv[2];
const prsFile = process.argv[3];
const years = ["2022"];

async function get(prs, token) {
  const requestHeaders = {
    Authorization: `token ${token}`,
  };

  const reviews = [];
  for (const pr of prs) {
    const r = await fetch(`${pr.url}/reviews`, {
      method: "GET",
      headers: requestHeaders,
    });
    const json = await r.json();
    for (const review of json) {
      if (review.state != "COMMENTED") {
        reviews.push(review);
      }
    }
  }
  console.log(JSON.stringify(reviews, null, "\t"));
}

const prJSON = fs.readFileSync(prsFile, "utf8");
const prs = JSON.parse(prJSON);

// get only PRs merged in this time period
const filteredPRs = prs.filter((pr) => {
  if (pr.merged_at) {
    return years.includes(pr.merged_at.slice(0, 4));
  }
  return false;
});

get(filteredPRs, token);
