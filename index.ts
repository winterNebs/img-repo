import { config } from "dotenv";
import express, { Application, Request, Response } from "express";
//import * as fs from "fs";
import { join } from "path";
import mongoose from "mongoose";
import { ImageModel, UserModel } from "./models";
import passport from "passport";
import {urlencoded} from "body-parser";
import session from "express-session";
config({ path: join(__dirname, "/../.env") });

const app: Application = express();
const port: number = Number(process.env.PORT || 8080);
const root: string = process.env.ROOT || "img";

passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());
// connect to db
(async () => {
  try {
    await mongoose.connect(process.env.DB || "mongodb://localhost/", {
      useNewUrlParser: true,
    });
    // hard code some db entries
    // make this into a mongo thing??
    /*
    let user = new UserModel({
      name: "buyer",
      balance: 5000,
    });
    await UserModel.register(user, "buyerpw");
    let user1 = new  UserModel({
      name: "seller",
      balance: 10,
    });
    await UserModel.register(user1, "sellerpw");
*/
    /*
    const id= new mongoose.Types.ObjectID("5fe8eebbb4d4cc49436a9675");
    const { _id: id } = await UserModel.create({
      name: "seller",
      balance: 5,
      password: "sellerpw",
    } as User);
    await UserModel.create({
      name: "buyer",
      balance: 5000,
      password: "buyerpw",
    } as User);
    await ImageModel.create({
      name: "img1",
      price: 10,
      path: "1011.jpg",
      owner: id,
    } as Image);
    await ImageModel.create({
      name: "img2",
      price: 11,
      path: "1015.jpg",
      owner: id,
    } as Image);
    await ImageModel.create({
      name: "img3",
      price: 11,
      path: "1022.jpg",
      owner: id,
    } as Image);
    await ImageModel.create({
      name: "img4",
      price: 12,
      path: "1024.jpg",
      owner: id,
    } as Image);
    await ImageModel.create({
      name: "img5",
      price: 11,
      path: "1031.jpg",
      owner: id,
    } as Image);
    */
  } catch (err) {
    console.log(err);
  }
})();
const db = mongoose.connection;

app.use(express.static(root));
app.use(urlencoded({ extended: true }));
app.use(session({secret: process.env.SECRET|| "oopsies"}));
app.use(passport.initialize());
app.use(passport.session());
app.set("views", "./views");
app.set("view engine", "pug");

// routes
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.redirect("/");
});
app.get("/login", (req, res) => {
  res.redirect("/");
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
app.get("/", async (req: Request, res: Response) => {
  // get images
  let images = await ImageModel.find({});
  res.render("index", { user: req.user, title: "Img Repo", images: images });
});

app.listen(port, () => {
  console.log("Started on port: " + port);
});
