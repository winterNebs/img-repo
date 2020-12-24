import { getModelForClass, prop } from "@typegoose/typegoose";

export class User {
  @prop({ required: true, unique: true })
  public name!: string;
  @prop({ required: true })
  public balance!: number;
}

export const UserModel = getModelForClass(User);

export class Image {
  @prop({ reuired: true, unique: true })
  public name!: string;
  @prop({ required: true })
  public price!: number;
  @prop({ required: true })
  public path!: string;
}

export const ImageModel = getModelForClass(Image);
