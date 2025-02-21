import multer, { diskStorage } from "multer";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
const upload = function () {
  const storage = diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
      const namedPicture = nanoid() + "_" + file.originalname;
      // console.log(namedPicture);
      cb(null, `users/${namedPicture}`);
    },
  });
  const multerUpload = multer({ storage });
  return multerUpload;
};
export default upload;
