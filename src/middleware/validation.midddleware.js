import joi from "joi";
import { Types } from "mongoose";
const validtion = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    const result = schema.validate(data, { abortEarly: false });
    if (result.error) {
      const messageList = result.error.details.map((obj) => obj.message);
      return next(new Error(messageList, { cause: 400 }));
    }
    return next();
  };
};

export const isValidObjectId = (value, helper) => {
  if (Types.ObjectId.isValid(value)) return true;
  return helper.message("Invalid ObjectId");
};

export default validtion;
