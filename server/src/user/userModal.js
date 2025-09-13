import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    accountVerified: { type: Boolean, default: false },
    verificationCode: {type:String,default:''},
    verificationCodeExpireAt: {type:Date,default:null},
    resetPassword: {type:String,default:''},
    resetPasswordExpireAt: {type:Date,default:null},
  },
  { timestamps: true }
);

const userModal = mongoose.model("user", userSchema);
export default userModal;
