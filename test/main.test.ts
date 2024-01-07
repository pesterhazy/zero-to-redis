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

  async workflowStatus(workflowId) {
    let result = await this.gqlClient.query(
      `
query workflowStatus($workflowId: String!) {
  workflowStatus(workflowId: $workflowId) {
    status
    error
  }
}
`,
      "workflowStatus",
      {
        workflowId: workflowId,
      },
    );
    return result;
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

  async templateDeploy() {
    let result = await this.gqlClient.query(
      `
mutation templateDeploy($input: TemplateDeployInput!) {
  templateDeploy(input: $input) {
    projectId
    workflowId
  }
}
    `,
      "templateDeploy",
      {
        input: {
          templateCode: "redis",
          services: [
            {
              variables: {
                REDISUSER: "default",
                REDIS_PASSWORD:
                  '${{ secret(32, "abcdefghijklmnopABCDEFGHIJKLMNOP123456") }}',
                REDISPASSWORD: "${{ REDIS_PASSWORD }}",
                REDISPORT: "${{ RAILWAY_TCP_PROXY_PORT }}",
                REDISHOST: "${{ RAILWAY_TCP_PROXY_DOMAIN }}",
                REDIS_URL:
                  "redis://default:${{ REDIS_PASSWORD }}@${{ RAILWAY_TCP_PROXY_DOMAIN }}:${{ RAILWAY_TCP_PROXY_PORT }}",
                REDIS_PRIVATE_URL:
                  "redis://default:${{ REDIS_PASSWORD }}@${{ RAILWAY_PRIVATE_DOMAIN }}:6379",
                RAILWAY_RUN_UID: "0",
                RAILWAY_RUN_AS_ROOT: "true",
              },
              template: "bitnami/redis",
              serviceName: "Redis",
              serviceIcon: "https://devicons.railway.app/i/redis.svg",
              hasDomain: false,
              tcpProxyApplicationPort: 6379,
              volumes: [{ name: "redis data", mountPath: "/bitnami" }],
              id: "b4020063-80a2-4cc7-966a-57227cf4a9a0",
            },
          ],
        },
      },
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

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.deepEqual(
    {
      data: {
        templateDeploy: {
          projectId: "d07e7997-a1c4-4f59-b88b-e869a756fcb6",
          workflowId:
            "deployTemplate/project/d07e7997-a1c4-4f59-b88b-e869a756fcb6/D_lJco",
        },
      },
    },
    await client.templateDeploy(),
  );
});

//{"query":"query workflowStatus($workflowId: String!) {\n  workflowStatus(workflowId: $workflowId) {\n    status\n    error\n  }\n}","variables":{"workflowId":"deployTemplate/project/877308d1-e870-4bee-9c85-559f03d1116d/rLZNWn"},"operationName":"workflowStatus"}

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.deepEqual(
    {
      data: {
        workflowStatus: {
          error: null,
          status: "Complete",
        },
      },
    },
    await client.workflowStatus(
      "deployTemplate/project/877308d1-e870-4bee-9c85-559f03d1116d/rLZNWn",
    ),
  );
});
