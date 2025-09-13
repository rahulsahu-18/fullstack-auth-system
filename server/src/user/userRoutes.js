import express from "express";
import { logInUser, logout, registerUser, resetPasswordOtp, sendOtp, verifyOtp, verifyResetPassword } from "./userController.js";
import isAuthorize from "../middleware/authMiddleware.js";

const userRoute = express.Router();


userRoute.post('/register',registerUser)
userRoute.post('/login',logInUser)
userRoute.post('/logout',logout)
userRoute.post('/sendotp',isAuthorize,sendOtp)
userRoute.post('/verifyotp',isAuthorize,verifyOtp)
userRoute.post('/resetpassword',isAuthorize,resetPasswordOtp)
userRoute.post('/resetverifypassword',isAuthorize,verifyResetPassword)

export default userRoute;