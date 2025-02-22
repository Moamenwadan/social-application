import { Router } from "express";
import * as userService from "./user.service.js";
import isAuthuenticated from "../../middleware/auth.middleware.js";
import isAuthorized from "../../middleware/authorization.middleware.js";
import { roles } from "../../DB/models/user.model.js";
import { validation } from "../../middleware/validation.midddleware.js";
import * as userSchemaValidation from "./user.validation.js";
import upload from "../../utils/fileUploads/multerUploading.js";
const router = Router();
// add user
// router.post("/", userService.addUser);
router.get(
  "/profile",
  isAuthuenticated,
  isAuthorized(roles.user, roles.admin),
  userService.profile
);
router.patch(
  "/updateProfile",
  isAuthuenticated,
  isAuthorized(roles.user, roles.admin),
  validation(userSchemaValidation.updateProfile),
  userService.updateUser
);
router.patch(
  "/updatePassword",
  validation(userSchemaValidation.updatePassword),
  isAuthuenticated,
  isAuthorized(roles.user, roles.admin),
  userService.updatePassword
);
router.delete(
  "/freezeAccount",
  isAuthuenticated,
  isAuthorized(roles.user, roles.admin),
  userService.freezeAccount
);
router.get(
  "/:userId",
  validation(userSchemaValidation.shareProfile),
  userService.shareProfile
);
router.post(
  "/profilePicture",
  isAuthuenticated,
  upload().single("image"),
  // validation(userSchemaValidation.shareProfile),
  userService.updateProfilePicture
);
router.delete(
  "/deleteProfilePicture",
  isAuthuenticated,
  userService.deleteProfilePicture
);
router.post(
  "/profilePictureCloudinary",
  isAuthuenticated,
  upload().single("image"),
  // validation(userSchemaValidation.shareProfile),
  userService.addProfilePictureInCloudinary
);
router.delete(
  "/deleteprofilePictureCloudinary",
  isAuthuenticated,
  // validation(userSchemaValidation.shareProfile),
  userService.deleteProfilePictureInCloudinary
);

export default router;
