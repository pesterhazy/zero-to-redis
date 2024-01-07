// TODO: why no squigglies?

import test from "node:test";
import assert from "node:assert/strict";

async function me() {
  let body = {
    query: `
query me {
  me {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  email
  name
}
`,
    operationName: "me",
  };
  let response = await fetch("https://backboard.railway.app/graphql/v2", {
    body: JSON.stringify(body),
    headers: {
      authorization: "Bearer " + process.env.RAILWAY_API_TOKEN,
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) throw "HTTP request failed: " + response.status;

  let json = await response.json();
  return json.data.me.name;
}

test(async function () {
  assert.equal("Paulus Esterhazy", await me());
});
