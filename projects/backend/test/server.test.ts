import test from "node:test";
import assert from "node:assert/strict";

import * as server from "../lib/server.ts";

test(async () => {
  let [router, httpServer] = (await server.run(0)) as any;
  try {
    router.get("/test", async (req, res) => {
      res.status(200).end();
    });
    let result = await fetch(
      "http://localhost:" + httpServer.address().port + "/test",
    );
    assert.ok(result.ok);
  } finally {
    httpServer.close();
  }
});
