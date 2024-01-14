// UI: no project -> Zero to Redis
// UI: project -> Redis to Zero

import { RecRailwayGQLClient, RailwayClient } from "../lib/railway-client.ts";

import test from "node:test";
import assert from "node:assert/strict";

test("returns name", async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.equal("Paulus Esterhazy", await client.me());
});

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  assert.deepEqual(
    {
      "project-name": "trusty-party",
      "project-id": "bd9ea61e-d7b5-4590-91da-9b7cb8b8b796",
      "service-id": "86e18e3e-278d-4fc1-a71a-8da6050b9f6b",
      "environment-id": "76e0cfd5-4b75-4e4e-8f0d-0a5716a8e36e",
    },
    await client.findRedis(),
  );
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

test(async function () {
  let client = new RailwayClient(new RecRailwayGQLClient(true));
  let result = await client.variables(
    "bd9ea61e-d7b5-4590-91da-9b7cb8b8b796",
    "76e0cfd5-4b75-4e4e-8f0d-0a5716a8e36e",
    "86e18e3e-278d-4fc1-a71a-8da6050b9f6b",
  );
  assert.equal(result.variables.REDISHOST, "viaduct.proxy.rlwy.net");
});
