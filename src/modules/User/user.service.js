import User, {
  defaultPicture,
  defaultProfilePictureCloudinary_public_id,
  defaultProfilePictureCloudinary_secure_url,
} from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHanler.js";
import { compareHash, hash } from "../../utils/hashing/hash.js";
import fs from "fs";
import path from "path";
import cloudinary from "../../utils/fileUploads/cloudinaryConfig.js";
export const profile = asyncHandler(async (req, res) => {
  let { user } = req;
  // const phone = CryptoJS.AES.decrypt(
  //   user.phone,
  //   process.env.PRIVATE_KEY
  // ).toString(CryptoJS.enc.Utf8);
  const phone = decrypt({ cipherText: user.phone });

  return res.status(200).json({
    status: "success",
    results: { ...user, phone },
  });
});
export const findAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("userName email age");
  console.log(users);
  return users
    ? res.status(200).json({
        success: true,
        message: "succeessfully find all users",
        users,
      })
    : res
        .status(404)
        .json({ success: false, message: "the user does't exist" });
});
export const updateUser = asyncHandler(async (req, res) => {
  let { userName, phone, gender } = req.body;
  // console.log(user);
  if (phone) {
    phone = encrypt({ plainText: phone });
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { userName, phone, gender },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    success: true,
    message: "user updated successfully",
    user,
  });
});
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (!compareHash({ plainText: oldPassword, hashValue: req.user.password })) {
    return next(new Error("invalid user password", { cause: 400 }));
  }
  const hashPassword = hash({ plainText: password });
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: hashPassword,
      changePasswordTime: Date.now(),
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "password updated successfully",
    user,
  });
});

export const freezeAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      deleted: true,
      changePasswordTime: Date.now(),
    },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "account freeze successfully",
    user,
  });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select("userName gender");
  user
    ? res.status(200).json({
        success: true,
        message: "account freeze successfully",
        user,
      })
    : next(new Error("Invalid account Id", { cause: 404 }));
});
export const updateProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      profilePicture: req.file.path,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));
  return res.status(200).json(user);
});

export const deleteProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));
  fs.unlinkSync(path.resolve(".", user.profilePicture));
  user.profilePicture = defaultPicture;
  await user.save();
  return res.status(200).json(user);
});
export const addProfilePictureInCloudinary = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `social app/users/${user._id}/profilePictures` }
    );
    user.profilePictureCloudinary = { secure_url, public_id };
    await user.save();

    return res.json({
      success: true,
      message: "update profilePicture for cloudinary successfully",
      user,
    });
  }
);
export const deleteProfilePictureInCloudinary = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));

    const results = await cloudinary.uploader.destroy(
      user.profilePictureCloudinary.public_id
    );
    user.profilePictureCloudinary = {
      secure_url: defaultProfilePictureCloudinary_secure_url,
      public_id: defaultProfilePictureCloudinary_public_id,
    };
    await user.save();

    return res.json({
      success: true,
      message: "update profilePicture for cloudinary successfully",
      user,
    });
  }
);
