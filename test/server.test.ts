import test from "node:test";
import assert from "node:assert/strict";

import * as server from "../lib/server.ts";

test(() => {
  let httpServer = server.run();
  httpServer.close();
});
