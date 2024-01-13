// TODO:

/*
  ERROR HANDLING:

    errors: [
    {
      message: 'Free plan resource provision limit exceeded. Please upgrade to provision more resources!',
      locations: [Array],
      path: [Array],
      extensions: [Object]
    }
    ]
*/

import express from "express";
import Router from "express-promise-router";
import { RailwayClient } from "./railway-client";

const defaultPort = 4004;

const MAX_ATTEMPTS = 60 * 10;

async function start() {
  let client = new RailwayClient();

  let result = await client.templateDeploy();
  let workflowId = result.data.templateDeploy.workflowId;

  let attempts = 0;

  while (true) {
    attempts++;
    if (attempts > MAX_ATTEMPTS) throw "Giving up";

    let result = await client.workflowStatus(workflowId);
    if (result.data.workflowStatus.status !== "Pending")
      return result.data.workflowStatus;
  }
}

async function stop({ id }) {
  let client = new RailwayClient();

  return await client.projectDelete(id);
}

export async function run(port = defaultPort) {
  let app = express();
  const router = Router();
  app.use(express.json());
  app.use(router);

  router.post("/start", async (req, res) => {
    res.send(await start());
    res.status(200).end();
  });

  router.post("/stop", async (req, res) => {
    res.send(await stop(req.body));
    res.status(200).end();
  });

  return new Promise((resolve) => {
    let httpServer = app.listen(port, () => {
      console.log("Ready at port", port);
      resolve(httpServer);
    });
  });
}
