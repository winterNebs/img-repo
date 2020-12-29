import mongoose, {
  Document,
  Model,
  PassportLocalDocument,
  PassportLocalModel,
  PassportLocalSchema,
} from "mongoose";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

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
userSchema.plugin(passportLocalMongoose, { usernameField: "name" });

export const UserModel: PassportLocalModel<IUser> = mongoose.model(
  "User",
  userSchema as PassportLocalSchema
);

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

export const ImageModel: Model<IImage> = mongoose.model("Image", imageSchema);
