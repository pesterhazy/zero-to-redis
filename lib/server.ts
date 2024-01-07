import express from "express";

const defaultPort = 4004;

export function run(port = defaultPort) {
  let app = express();

  return app.listen(port);
}
