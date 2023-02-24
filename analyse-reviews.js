/*
This script analyses PRs to figure out who reviewed them.

It takes 2 arguments:
- a relative path to a JSON file containing the reviews to analyse (reviews.json). This is probably the output of a previous call to query-reviews.js
- a relative path to a JSON file containing the PRs that these reviews are for.

Given these it lists all reviewers who performance at least one review, with the number of reviews they performed.

It only looks at "community PRs", meaning PRs not filed by a core maintainer (basically Mozilla or OWD).
It also excludes bot reviews.

node analyse-reviews.js PATH/TO/REVIEWS.JSON PATH/TO/PRS.JSON > reviews.csv
*/

const fs = require("fs");

const reviewsFile = process.argv[2];
const prsFile = process.argv[3];

function getReviewers(json) {
  const year = "2022";

  function isCommunityReview(review) {
    const maintainers = [
      "queengooborg",
      "hamishwillee",
      "dipikabh",
      "Rumyra",
      "bsmth",
      "ddbeck",
      "schalkneethling",
      "LeoMcA",
      "fiji-flo",
      "Guyzeroth",
      "caugner",
      "rebloor",
      "teoli2003",
      "wbamberg",
      "estelle",
      "Elchi3",
    ];

    const pr = prs.find(
      (candidate) => candidate.url === review.pull_request_url
    );

    if (pr) {
      if (!maintainers.includes(pr.user.login)) {
        return true;
      }
    }
    return false;
  }

  const reviewers = {};

  for (const review of json) {
    if (!review.submitted_at) continue;
    if (!isCommunityReview(review)) continue;
    const prefix = review.submitted_at.slice(0, 4);
    if (!year === prefix) continue;
    if (review.user.login === "mdn-bot") continue;
    if (reviewers[review.user.login]) {
      reviewers[review.user.login]++;
    } else {
      reviewers[review.user.login] = 1;
    }
  }

  return reviewers;
}

function logReviewers(reviewers) {
  const reviewerNames = Object.keys(reviewers);
  for (reviewer of reviewerNames) {
    console.log(`${reviewer}, ${reviewers[reviewer]} `);
  }
}

const reviewsJSON = fs.readFileSync(reviewsFile, "utf8");
const reviews = JSON.parse(reviewsJSON);

const prsJSON = fs.readFileSync(prsFile, "utf8");
const prs = JSON.parse(prsJSON);

const reviewers = getReviewers(reviews);
logReviewers(reviewers);
