import express from "express";

const port = 4004;

export function run() {
  let app = express();

  return app.listen(4004);
}
