// TODO: why no squigglies?

import test from "node:test";
import assert from "node:assert/strict";

async function me() {
  let body = {
    query:
      "query me {\n" +
      "  me {\n" +
      "    ...UserFields\n" +
      "  }\n" +
      "}\n" +
      "\n" +
      "fragment UserFields on User {\n" +
      "  id\n" +
      "  email\n" +
      "  name\n" +
      "}\n",
    operationName: "me",
  };
  let response = await fetch(
    "https://backboard.railway.app/graphql/internal?q=me",
    {
      body: JSON.stringify(body),
      headers: {
        authorization: "Bearer " + process.env.RAILWAY_API_TOKEN,
        "content-type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) throw "HTTP request failed: " + response.status;

  let json = await response.json();
  return json.data.me.name;
}

test(async function () {
  assert.equal("Paulus Esterhazy", await me());
});
