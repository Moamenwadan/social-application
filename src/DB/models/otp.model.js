import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      required: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    otp: {
      type: String,
      required: [true, "you must generate otp"],
    },
  },
  { timestamps: true }
);
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 20 });
const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
