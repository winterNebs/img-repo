import { config } from "dotenv";
import express, { Application, Request, Response } from "express";
import * as fs from "fs";
import { join } from "path";
import * as mongoose from "mongoose";
import { ImageModel, Image } from "models";
config({ path: join(__dirname, "/../.env") });

const app: Application = express();
const port: number = Number(process.env.PORT || 8080);
const root: string = process.env.ROOT || "img";

// connect to db
(async () => {
  try {
    await mongoose.connect(process.env.DB || "mongodb://localhost/", {
      useNewUrlParser: true,
    });
    // hard code some db entries

    await ImageModel.create({
      name: "img1",
      price: 10,
      path: "1011.jpg",
    } as Image);
  } catch (err) {
    console.log(err);
  }
})();
const db = mongoose.connection;

app.use(express.static(root));
app.set("views", "./views");
app.set("view engine", "pug");

// routes
app.get("/", async (req: Request, res: Response) => {
  const files = await fs.promises.readdir(root);
  const cols = req.query.cols || 2;
  res.render("index", { title: "test", cols: cols, files: files });
});

app.listen(port, () => {
  console.log("Started on port: " + port);
});
