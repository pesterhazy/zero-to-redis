import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

function md5(s) {
  return createHash("md5").update(s).digest("hex");
}

export class RailwayGQLClient {
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

export class RecRailwayGQLClient {
  client: RailwayGQLClient;
  replay: boolean;
  suffix: string;

  constructor(replay: boolean = false, suffix: string = "") {
    this.client = new RailwayGQLClient();
    this.replay = replay;
    this.suffix = suffix;
  }

  async query(query, operationName, variables?) {
    let hash =
      md5(JSON.stringify([query, operationName, variables])) + this.suffix;

    if (this.replay) {
      return JSON.parse(readFileSync("snapshots/" + hash, "utf8"));
    } else {
      let result = await this.client.query(query, operationName, variables);
      writeFileSync("snapshots/" + hash, JSON.stringify(result));
      return result;
    }
  }
}

export class RailwayClient {
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
              id
            }
          }
        }
        environments {
          edges {
            node {
              name
              id
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
      // Hackity hack: find project that has a service called Redis
      return project.node.services.edges.some(
        (edge) => edge.node.name === "Redis",
      );
    });

    if (!project) return {};

    return {
      projectName: project.node.name,
      projectId: project.node.id,
      serviceId: project.node.services.edges[0].node.id,
      environmentId: project.node.environments.edges[0].node.id,
    };
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

  async variables({ projectId, environmentId, serviceId }) {
    let result = await this.gqlClient.query(
      `
query variables($projectId: String!, $environmentId: String!, $pluginId: String, $serviceId: String) {
  variables: variables(
    projectId: $projectId
    environmentId: $environmentId
    pluginId: $pluginId
    serviceId: $serviceId
  )
  unrenderedVariables: variables(
    projectId: $projectId
    environmentId: $environmentId
    pluginId: $pluginId
    serviceId: $serviceId
    unrendered: true
  )
}
`,
      "variables",
      {
        projectId,
        environmentId,
        serviceId,
      },
    );
    return result.data;
  }
}
