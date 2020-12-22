import express, { Application, Request, Response } from "express";
import * as fs from "fs";

const app: Application = express();
const port: number = 8080;
const root: string = process.argv[3] || ".";
app.set("views", "./views");
app.set("view engine", "pug");
app.get("/", async (req: Request, res: Response) => {
  const files = await fs.promises.readdir(root);
  res.render("index", { title: "test", files: files });
});
app.listen(port, () => {
  console.log("Started on port: " + port);
});
