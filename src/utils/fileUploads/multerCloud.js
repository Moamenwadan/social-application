import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
const multerCloudinary = function () {
  const storage = diskStorage({});
  const multerUpload = multer({ storage });
  return multerUpload;
};
export default multerCloudinary;
