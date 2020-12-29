import mongoose, {
  Document,
  Model,
  PassportLocalDocument,
  PassportLocalModel,
  PassportLocalSchema,
} from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

// user interface
export interface IUser extends PassportLocalDocument {
  name: string;
  balance: number;
  images: mongoose.Types.ObjectId[]
}
const userSchema = new mongoose.Schema({
  name: String,
  balance: Number,
  images: [mongoose.Types.ObjectId] 
});
// set up user to use passportLocalMongoose to handle credentials
userSchema.plugin(passportLocalMongoose, { usernameField: "name" });

// create the talbe in the database
export const UserModel: PassportLocalModel<IUser> = mongoose.model(
  "User",
  userSchema as PassportLocalSchema
);

// images
export interface IImage extends Document {
  name: string;
  price: number;
  path: string;
  owner: mongoose.Types.ObjectId;
}

const imageSchema = new mongoose.Schema({
  name: String,
  price: Number,
  path: String,
  owner: mongoose.Types.ObjectId,
});
// create table in database 
export const ImageModel: Model<IImage> = mongoose.model("Image", imageSchema);
