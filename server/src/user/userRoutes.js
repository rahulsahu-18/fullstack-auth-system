import express from "express";
import { logInUser, logout, registerUser } from "./userController.js";

const userRoute = express.Router();


userRoute.post('/register',registerUser)
userRoute.post('/login',logInUser)
userRoute.post('/logout',logout)

export default userRoute;