// TODO: why no squigglies?

import test from "node:test";
import assert from "node:assert/strict";

class RailwayClient {
  async query(q) {
    let body = {
      query: q,
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

  async me() {
    return this.query(`
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
`);
  }
}

test(async function () {
  let client = new RailwayClient();
  assert.equal("Paulus Esterhazy", await client.me());
});
