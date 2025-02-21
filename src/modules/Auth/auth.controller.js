import { Router } from "express";
import {
  login,
  register,
  activateAccount,
  generateOTP,
  forget_password,
  reset_password,
  new_access,
  updateEmail,
  verifyNewEmail,
  // loginWithGmail,
} from "./auth.service.js";
import isAuthuenticated from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.midddleware.js";
import * as authSchema from "./auth.validation.js";
const router = Router();

router.post("/register", validation(authSchema.registerSchema), register);
router.post("/login", validation(authSchema.loginSchema), login);
router.get("/activate_account/:token", activateAccount);
router.post(
  "/generate_otp",
  validation(authSchema.generateOtpSchema),
  generateOTP
);
router.post(
  "/forget_password",
  validation(authSchema.forget_password),
  forget_password
);
router.post(
  "/reset_password",
  validation(authSchema.reset_password),
  reset_password
);
// router.post(
//   "/loginWithGmail",
//   validation(authSchema.loginWithGmail),
//   loginWithGmail
// );
// update Email
router.post("/new_access", validation(authSchema.new_access), new_access);
router.post(
  "/update_email",
  isAuthuenticated,
  validation(authSchema.updateEmail),
  updateEmail
);
router.get(
  `/verifyEmail/:token`,
  validation(authSchema.verifyNewEmail),
  verifyNewEmail
);
export default router;
