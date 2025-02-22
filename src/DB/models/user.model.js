// import { object, string } from "joi";
import { Schema, model } from "mongoose";
import { type } from "os";
export const genders = {
  male: "male",
  female: "female",
};
export const roles = {
  user: "user",
  admin: "admin",
};
export const providers = {
  system: "system",
  google: "google",
};
export const defaultPicture =
  "uploads\\users\\kYNl8hxPfGVWVFLZ7Xst7_default_picture.png";
export const defaultProfilePictureCloudinary_secure_url =
  "https://res.cloudinary.com/dr4po5j8x/image/upload/v1740223824/zvahxz4dub5crc4muqer.png";
export const defaultProfilePictureCloudinary_public_id =
  "zvahxz4dub5crc4muqer.png";
const userSchema = new Schema(
  {
    userName: { type: String, minLength: 4, maxLength: 20, required: true },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: [true, "email must be unique"],
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: function () {
        return this.provider == "google" ? false : true;
      },
    },
    gender: { type: String, enum: Object.values(genders) },
    isActivated: { type: Boolean, default: false },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(roles), default: roles.user },
    changePasswordTime: { type: Date },
    deleted: { type: Boolean, default: false },
    provider: { type: String, enum: Object.values(providers) },
    tempEmail: { type: String },
    profilePicture: { type: String, default: defaultPicture },
    profilePictureCloudinary: {
      secure_url: {
        type: String,
        default: defaultProfilePictureCloudinary_secure_url,
      },
      public_id: {
        type: String,
        default: defaultProfilePictureCloudinary_public_id,
      },
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
