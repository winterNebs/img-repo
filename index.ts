import { config } from "dotenv";
import express, { Application } from "express";
import { join } from "path";
import mongoose from "mongoose";
import { IImage, ImageModel, IUser, UserModel } from "./models";
import passport from "passport";
import { urlencoded } from "body-parser";
import session from "express-session";
// import environmental variables
config({ path: join(__dirname, "/../.env") });

// standard express boilerplate
const app: Application = express();
const port: number = Number(process.env.PORT || 8080);
const root: string = process.env.ROOT || "img";

// setup passport for user authentication
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());
// connect to db
(async () => {
  try {
    await mongoose.connect(process.env.DB || "mongodb://localhost/", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // hard code some db entries
    // uncomment this if you are running for the first time
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
    const id= user1._id;
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

// setup express boilerplate
app.use(express.static(root)); // static root for images
app.use(urlencoded({ extended: true })); // need this for body parsing (forms)
app.use(
  //sessions so that users stay logged in while server is on
  session({
    secret: process.env.SECRET || "oopsies",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize()); // initialize passport
app.use(passport.session());
app.set("views", "./views");
app.set("view engine", "pug");

// routes
// login route that uses passport to authenticate
app.post("/login", passport.authenticate("local"), (req, res) => {
  // successful login redirect to /
  res.redirect("/");
});
// if they try to get the login page redirect to /
app.get("/login", (req, res) => {
  res.redirect("/");
});
// logout page logs them out and redirects to /
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
// "sell" endpoint allows image owners to update the price of the images
app.post("/sell/:id", async (req, res) => {
  // make sure they are logged in
  if (!req.isAuthenticated || !req.user) {
    (req.session as any).messages = [
      {
        style: "danger",
        message: "You must be logged in",
      },
    ];
    res.redirect("/");
    return;
  }
  // check that they are the owner
  let user = req.user as IUser;
  // find image in db
  let img = await ImageModel.findById(req.params.id);
  if (!img!.owner.equals(user._id)) {
    (req.session as any).messages = [
      {
        style: "danger",
        message: "You do not own this image",
      },
    ];
    res.redirect("/");
    return;
  }
  // update image price
  img!.price = req.body.price;
  await img!.save();
  // then redirect or something
  (req.session as any).messages = [
    {
      style: "success",
      message: "Price of " + img!.name + " updated to: " + img!.price + "$",
    },
  ];
  res.redirect("/");
});
// buy endpoint lets users buy images
app.post("/buy/:id", async (req, res) => {
  // checks if they are logged in
  if (!req.isAuthenticated || !req.user) {
    (req.session as any).messages = [
      {
        style: "danger",
        message: "You must be logged in",
      },
    ];
    res.redirect("/");
    return;
  }
  // check that they dont own it already
  let user = req.user as IUser;
  if (user.images.includes(new mongoose.Types.ObjectId(req.params.id))) {
    (req.session as any).messages = [
      {
        style: "danger",
        message: "You already own this image",
      },
    ];
    res.redirect("/");
    return;
  }
  // find image in db
  let img = await ImageModel.findById(req.params.id);
  // compare price to user balance
  if (img!.price > user.balance) {
    (req.session as any).messages = [
      {
        style: "danger",
        message: "Insufficient Funds" + img!.name,
      },
    ];
    res.redirect("/");
    return;
  }
  // buy it
  user.balance -= img!.price;
  user.images.push(img!._id);
  await user.save();
  // subtract balance
  // add blance to seller
  let owner = await UserModel.findById(img!.owner);
  owner!.balance += img!.price;
  await owner!.save();
  // then redirect or something
  (req.session as any).messages = [
    {
      style: "success",
      message: "You bought: " + img!.name,
    },
  ];
  res.redirect("/");
});
// home page
app.get("/", async (req, res) => {
  // get images to display on the website
  let images = await ImageModel.find({});
  // get any messages/banners that need to be displayed
  let messages = (req.session as any).messages;
  // clear those messages so they don't reappear again
  (req.session as any).messages = undefined;
  // make a list of images that the user owns
  let owned: undefined | IImage[];
  if (req.user) {
    let u: IUser = req.user as IUser;
    owned = images.filter((i) => u.images.includes(i._id));
  }
  // render the page
  res.render("index", {
    messages: messages,
    user: req.user,
    title: "Img Repo",
    images: images,
    owned: owned,
  });
});

// 404 handler
app.use((req, res, next) => {
  // create 404 error and pass to error handler
  let err = { message: "Not Found", status: 404 };
  next(err);
});
// error handler
app.use((err: any, req: any, res: any, next: any) => {
  // display a simple error page
  res.render("error", { title: err.message, error: err });
});
app.listen(port, () => {
  console.log("Started on port: " + port);
});
