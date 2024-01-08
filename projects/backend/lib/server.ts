import express, { Request, Response } from "express";

const defaultPort = 4004;

export async function run(port = defaultPort) {
  let app = express();

  app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
  });

  return new Promise((resolve) => {
    let httpServer = app.listen(port, () => {
      resolve(httpServer);
    });
  });
}
