import express, { Request, Response } from "express";

const defaultPort = 4004;

export function run(port = defaultPort) {
  let app = express();

  app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
  });

  return app.listen(port);
}
