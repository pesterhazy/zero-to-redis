import test from "node:test";
import assert from "node:assert/strict";

async function me() {
  return "Paulus Esterhazy";
}

test(async function () {
  assert.equal("Paulus Esterhazy", await me());
});
