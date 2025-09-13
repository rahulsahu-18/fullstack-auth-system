import express from "express";
import { logInUser, logout, registerUser, sendOtp, verifyOtp } from "./userController.js";

const userRoute = express.Router();


userRoute.post('/register',registerUser)
userRoute.post('/login',logInUser)
userRoute.post('/logout',logout)
userRoute.post('/sendotp',sendOtp)
userRoute.post('/verifyotp',verifyOtp)

export default userRoute;