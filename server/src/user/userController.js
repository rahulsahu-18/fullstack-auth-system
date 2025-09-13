import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModal from "./userModal.js";
import jwt from 'jsonwebtoken';
import config from "../config/envConfig.js";

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    // Check if user already exists
    const userAlreadyExist = await userModal.findOne({ email });
    if (userAlreadyExist) {
      return next(createHttpError(400, "User already exists"));
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = await userModal.create({
      name,
      email,
      password: hashPassword,
    });

    // Create token
    const token = jwt.sign({ id: newUser._id }, config.JWT_TOKEN, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: config.TYPE === "Production", // ✅ Production ke liye true
      sameSite: config.TYPE === "Production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });

  } catch (error) {
    return next(createHttpError(500, `Server Error: ${error.message}`));
  }
};


const logInUser = async (req, res, next) => {
  const { email, password } = req.body;

  // find user is exist or not
  let user;
  try {
    user = await userModal.findOne({ email });
  } catch (error) {
    res.json(error);
  }

  if (!user) return next(createHttpError(401, "user not found"));

  let isCorrect;
  try {
    isCorrect = bcrypt.compare(password, user.password);
  } catch (error) {}

  if (!isCorrect)
    return next(createHttpError(400, "you entered worng password"));

  const token = jwt.sign({ id: user._id }, config.JWT_TOKEN, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: config.TYPE === "Development",
    sameSite: config.TYPE === "Development" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ sucess: true, message: "login sucessfull" });
};

const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: config.TYPE === "Development",
      sameSite: config.TYPE === "Development" ? "none" : "strict",
    });
    res.json({ sucess: true, message: "logout sucessfull" });
  } catch (error) {
    return next(createHttpError(400,"something worng while logout"));
  }
};

export {logout,logInUser,registerUser}