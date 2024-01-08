import test from "node:test";
import assert from "node:assert/strict";

import * as server from "../lib/server.ts";

test(async () => {
  let httpServer: any = await server.run(0);
  try {
    let result = await fetch("http://localhost:" + httpServer.address().port);
    assert.ok(result.ok);
  } finally {
    httpServer.close();
  }
});
