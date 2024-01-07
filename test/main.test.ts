// Turn integration tests into unit tests
// RailwayClient.templateDeploy
// RailwayClient.workflowStatus
// RailwayClient.projectDelete
// UI: no project -> Zero to Redis
// UI: project -> Redis to Zero

import test from "node:test";
import assert from "node:assert/strict";

class RailwayGQLClient {
  async query(query, operationName, variables?) {
    let body: any = {
      query: query,
      operationName: operationName,
    };
    if (variables !== undefined) body.variables = variables;
    let response = await fetch("https://backboard.railway.app/graphql/v2", {
      body: JSON.stringify(body),
      headers: {
        authorization: "Bearer " + process.env.RAILWAY_API_TOKEN,
        "content-type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok)
      throw (
        "HTTP request failed: " +
        response.status +
        ", " +
        (await response.text())
      );

    let json = await response.json();
    return json;
  }
}

class RailwayClient {
  gqlClient: RailwayGQLClient;

  constructor() {
    this.gqlClient = new RailwayGQLClient();
  }

  async me() {
    let result = await this.gqlClient.query(
      `
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
      "me",
    );
    return result.data.me.name;
  }

  async findRedis() {
    let result = await this.gqlClient.query(
      `
query projects {
  projects {
    edges {
      node {
        id
        name
        services {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
}
`,
      "projects",
    );

    let project = result.data.projects.edges.find((project) => {
      // use a heuristic to find the project
      return project.node.services.edges.some(
        (edge) => edge.node.name === "Redis",
      );
    });

    if (!project) return undefined;

    return project.node.name;
  }

  async banana() {
    let result = await this.gqlClient.query(
      `
mutation eventBatchTrack($input: EventBatchTrackInput!) {
  eventBatchTrack(input: $input)
}
`,
      "eventBatchTrack",
      {
        input: {
          events: [],
        },
      },
    );

    return result;
  }
}

test(async function () {
  let client = new RailwayClient();
  assert.equal("Paulus Esterhazy", await client.me());
});

// test(async function () {
//   let client = new RailwayClient();
//   assert.equal("naive-button", await client.findRedis());
// });

// test(async function () {
//   let client = new RailwayClient();
//   assert.deepEqual({ data: { eventBatchTrack: true } }, await client.banana());
// });
