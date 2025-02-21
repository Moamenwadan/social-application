import User, { providers } from "../.././DB/models/user.model.js";
import bycrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { genders } from "../.././DB/models/user.model.js";
import { asyncHandler } from "../../utils/errorHandling/asyncHanler.js";
import { emailEmitter } from "../../utils/emails/email.event.js";
import joi from "joi";
import { hash, compareHash } from "../../utils/hashing/hash.js";
import { encrypt } from "../../utils/encryption/encryption.js";
import { generateToken, verifyToken } from "../../utils/token/token.js";
import Randomstring from "randomstring";
import OTP from "../../DB/models/otp.model.js";
import sendEmail from "../../utils/emails/sendEmail.js";
import { signup } from "../../utils/emails/generateHTML.js";
import { OAuth2Client } from "google-auth-library";

export const generateOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // console.log(user);
  if (user) return next(new Error("the user already exist", { cause: 404 }));
  const otp = Randomstring.generate({ length: 5, charset: "alphanumeric" });
  await sendEmail({ to: email, html: signup(otp) });
  const generateOtp = await OTP.create({
    email,
    otp,
  });
  return res.json({ success: true, otp: generateOtp });
});
export const register = asyncHandler(async (req, res, next) => {
  const { email, password, confirmPassword, phone, userName, otp } = req.body;
  // console.log(password, confirmPassword);
  if (password !== confirmPassword)
    return next(
      new Error("password must match confirmed password", { cause: 404 })
    );
  const checkOTP = await OTP.findOne({ email, otp });
  if (!checkOTP) return next(new Error("Invalid OTP", { cause: 404 }));

  const hashPassword = hash({ plainText: password });

  const encryptPhone = encrypt({ plainText: phone });

  // return res.json({ result });
  const user = await User.create({
    email,
    password: hashPassword,
    phone: encryptPhone,
    userName,
    isActivated: true,
  });
  // I put them in email.event.js
  // const token = jwt.sign({ email }, process.env.SECRET_TOKEN);
  // const link = `http://localhost:3000/auth/activate_account/${token}`;
  // const isSent = await sendEmail({
  //   to: user.email,
  //   subjects: subjects.register,
  //   html: signup(link),
  // });
  emailEmitter.emit("sendEmail", email);
  return res.status(200).json({
    success: true,
    message: "the user created successfully  ",
    user,
  });
});

// export const loginWithGmail = asyncHandler(async (req, res, next) => {
//   const { idToken } = req.body;
//   const client = new OAuth2Client();
//   async function verify() {
//     const ticket = await client.verifyIdToken({
//       idToken: idToken,
//       audience: `${process.env.CLIENT_ID}`,
//     });
//     const payload = ticket.getPayload();
//     return payload;
//   }
//   verify().catch(console.error);
//   const userData = await verify();
//   const { email_verified, email, name, picture } = userData;
//   if (!email_verified) return next(new Error("Email is invalid"));
//   await User.create({
//     email,
//     userName: name,
//     isActivated: true,
//     provider: providers.google,
//   });

//   return res.json({ success: true, message: "user login successfully" });
// });

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  // check if user exist
  if (!user)
    return res.status(403).json({ success: false, message: "Invalid Email" });
  // check if user existence
  if (!user.isActivated)
    return next(new Error("you must activate acount"), { cause: 400 });
  // if (!bycrypt.compareSync(password, user.password))
  //   return next(new Error("Invalid password"), { cause: 403 });
  if (!compareHash({ plainText: password, hashValue: user.password }))
    return next(new Error("Invalid password"), { cause: 403 });
  user.deleted = false;
  await user.save();
  // user.phone = CryptoJS.AES.decrypt(
  //   user.phone,
  //   process.env.PRIVATE_KEY
  // ).toString(CryptoJS.enc.Utf8);
  user.phone = encrypt({ plainText: user.phone });
  // const token = jwt.sign(
  //   { id: user._id, email: user.email, isloggedIn: true },
  //   "gjhghjgjfhgfhgfhgfhg"
  // );
  const access_token = generateToken({
    payload: { id: user._id, email: user.email, isloggedIn: true },
    options: { expiresIn: "2d" },
  });
  const refresh_token = generateToken({
    payload: { id: user._id, email: user.email, isloggedIn: true },
    options: { expiresIn: "30d" },
  });
  return res.status(200).json({
    success: true,
    message: "successfully login ",
    access_token,
    refresh_token,
  });
});
export const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = jwt.verify(token, process.env.SECRET_TOKEN);
  const user = await User.findOne({ email });
  if (!user) return next(new Error("document not found"), { cause: 400 });

  user.isActivated = true;
  await user.save();
  return res.status(200).json({ success: true, message: "try to login" });
});

export const forget_password = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email, deleted: false });
  if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));
  const findOtp = await OTP.findOne({ email: email });
  if (findOtp) {
    await OTP.deleteOne({ email: email });
  }
  const otp = Randomstring.generate({ length: 5, charset: "alphanumeric" });
  await sendEmail({ to: email, html: signup(otp) });
  await OTP.create({ email, otp });
  return res.status(200).json({ success: true, otp });
});
export const reset_password = asyncHandler(async (req, res, next) => {
  const { email, password, otp } = req.body;
  const findUserFromOtp = await OTP.findOne({ otp, email });
  if (!findUserFromOtp)
    return next(new Error("the otp doesn't exist", { cause: 404 }));
  const user = await User.findOne({ email: email });
  if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));
  user.password = hash({ plainText: password, rounds: 8 });
  await user.save();
  return res
    .status(201)
    .json({ success: true, message: "reset password successfully ", user });
});
export const new_access = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  const payload = verifyToken({
    token: token,
    options: { expiresIn: "1d" },
  });
  const user = await User.findById(payload.id);
  if (!user) return next(new Error("the user doesn't exist", { cause: 404 }));
  const access_token = generateToken({
    payload: { id: user.id, email: user.email, isloggedIn: true },
  });
  return res.status(201).json({
    success: true,
    message: "new access successfully ",
    access_token,
  });
});
