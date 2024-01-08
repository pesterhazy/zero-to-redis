// UI: no project -> Zero to Redis
// UI: project -> Redis to Zero

import { RecRailwayGQLClient, RailwayClient } from "../lib/railway-client.ts";

import test from "node:test";
import assert from "node:assert/strict";

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
