import express from "express";
import connectDB from "./DB/connection.js";
import userController from "./modules/User/user.controller.js";
import authController from "./modules/Auth/auth.controller.js";
import globalErrorHandler from "./utils/errorHandling/globalErrorHandler.js";
import notFoundHandler from "./utils/errorHandling/notFoundHandler.js";
import cors from "cors";
const boot = async (app, express) => {
  app.use(cors());
  await connectDB();
  app.use(express.json());
  app.get("/", (req, res, next) => {
    return res
      .status(200)
      .json({ message: "welcome the node js file from express" });
  });

  app.use("/auth", authController);
  app.use("/users", userController);

  app.all("*", notFoundHandler);
  app.use(globalErrorHandler);
};
export default boot;
