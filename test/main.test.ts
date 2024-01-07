// RailwayClient.templateDeploy
// RailwayClient.workflowStatus
// UI: no project -> Zero to Redis
// UI: project -> Redis to Zero

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, existsSync, writeFileSync } from "node:fs";

function md5(s) {
  return createHash("md5").update(s).digest("hex");
}

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

class RecRailwayGQLClient {
  client: RailwayGQLClient;
  replay: boolean;

  constructor(replay: boolean = false) {
    this.client = new RailwayGQLClient();
    this.replay = replay;
  }

  async query(query, operationName, variables?) {
    let hash = md5(JSON.stringify([query, operationName, variables]));

    if (this.replay) {
      return JSON.parse(readFileSync("snapshots/" + hash, "utf8"));
    } else {
      let result = await this.client.query(query, operationName, variables);
      writeFileSync("snapshots/" + hash, JSON.stringify(result));
      return result;
    }
  }
}

class RailwayClient {
  gqlClient: any;

  constructor(gqlClient?: any) {
    this.gqlClient = gqlClient || new RailwayGQLClient();
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

  async eventBatchTrack() {
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

  async projectDelete(id: string) {
    let result = await this.gqlClient.query(
      `
mutation projectDelete($id: String!) {
  projectDelete(id: $id)
}
`,
      "projectDelete",
      { id: id },
    );

    return result;
  }
}

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.equal("Paulus Esterhazy", await client.me());
});

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.equal("naive-button", await client.findRedis());
});

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.deepEqual(
    { data: { eventBatchTrack: true } },
    await client.eventBatchTrack(),
  );
});

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.deepEqual(
    { data: { projectDelete: true } },
    await client.projectDelete("4363699d-fc7b-4b2e-bfa7-17d0525eb923"),
  );
});
