import joi from "joi";
import { genders } from "../../DB/models/user.model.js";
export const registerSchema = joi
  .object({
    userName: joi.string().min(4).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    confirmPassword: joi.string().valid(joi.ref("password")),
    gender: joi.string().valid(...Object.values(genders)),
    phone: joi.string().required(),
    otp: joi.string().required(),
  })
  .required();
export const loginSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  })
  .required();

export const generateOtpSchema = joi.object({
  email: joi.string().required(),
});
export const forget_password = joi.object({
  email: joi.string().required(),
});
export const reset_password = joi.object({
  otp: joi.string().required(),
  password: joi.string().required(),
  email: joi.string().required(),
  confirmPassword: joi.string().valid(joi.ref("password")).required(),
});
export const new_access = joi.object({
  token: joi.string().required(),
});
export const loginWithGmail = joi.object({
  idToken: joi.string().required(),
});
