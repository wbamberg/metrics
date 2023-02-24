/*
This script fetches **all** PRs to mdn/content and logs them as a stringified JSON array.

It takes your GitHub Personal Access Token as an argument.

You could call it like:

node query-prs.js MY-TOKEN > all-prs.json

*/

const fetch = require("node-fetch");

const startURL =
  "https://api.github.com/repos/mdn/content/pulls?state=all&per_page=100";
const token = process.argv[2];

function getNextURL(link) {
  const bits = link.split(",").map((bit) => bit.trim());
  const next = bits.find((bit) => bit.split(";")[1] === ' rel="next"');
  if (next) {
    return next.split(";")[0].slice(1, -1);
  }
  return null;
}

let all = [];

async function get(url, token) {
  const requestHeaders = {
    Authorization: `token ${token}`,
  };

  const r = await fetch(url, { method: "GET", headers: requestHeaders });
  const json = await r.json();
  all = all.concat(json);

  const link = r.headers.get("Link");
  const next = getNextURL(link);
  if (next) {
    get(next, token);
  } else {
    console.log(JSON.stringify(all, null, "\t"));
  }
}

get(startURL, token);
