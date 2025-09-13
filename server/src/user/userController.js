import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModal from "./userModal.js";
import jwt from "jsonwebtoken";
import config from "../config/envConfig.js";
import transpoter from "../config/nodemailer.config.js";

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
    // send welcome email
    const mailOption = {
      from: config.SENDER_EMAIL,
      to: email,
      subject: "welcome to auth app",
      text: `hii welcome mr/ms ${name}`,
    };
    await transpoter.sendMail(mailOption);
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
    return next(createHttpError(400, "something worng while logout"));
  }
};

const sendOtp = async (req, res,next) => {
  const { userId } = req.body;

  try {
    const user = await userModal.findById(userId);
    if (user.accountVerified) {
      res.json({
        sucess: "false",
        message: "account alredy verified",
      });
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = generatedOtp;
    user.verificationCodeExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    const emailtemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <tr>
      <td style="background-color: #4F46E5; color: white; text-align: center; padding: 20px;">
        <h1 style="margin: 0; font-size: 24px;">Auth app</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="color: #555; font-size: 16px;">
          Hi <strong>${user.name}</strong>,<br><br>
          Thank you for signing up! Please use the following verification code to complete your registration:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; border: 2px dashed #4F46E5; display: inline-block; padding: 10px 20px; border-radius: 8px;">
            ${generatedOtp}
          </p>
        </div>

        <p style="color: #555; font-size: 14px;">
          This code will expire in <strong>2 minutes</strong>.  
          If you didn’t request this, please ignore this email.
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #888;">
          Thanks,<br>
          <strong>Auth-app Team</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #777;">
        © 2025 YourApp. All rights reserved.
      </td>
    </tr>
  </table>
</body>
</html>
`;
    const mailOption = {
      from: config.SENDER_EMAIL,
      to: user.email,
      subject: "Verify Your Email - Authapp",
      html: emailtemplate,
    };

    await transpoter.sendMail(mailOption);
    res.json({
      sucess: "true",
      message: "verification code send sucessfully",
    });
  } catch (error) {
    return next(createHttpError(500, `server error ${error.message}`));
  }
};

const verifyOtp = async (req, res, next) => {
  const { userId, otp } = req.body;
  try {
    if (!userId || !otp) {
      return next(createHttpError(400, `missing detailse`));
    }
    const user = await userModal.findById(userId);
    if (user.accountVerified) {
      return next(createHttpError(400, `user alredy exist with veryfied`));
    }

    if (otp != user.verificationCode) {
      return next(createHttpError(400, `invalid otp`));
    }

    if (user.verificationCodeExpireAt < Date.now()) {
      return next(
        createHttpError(400, `plese otp timelimit excide please try again`)
      );
    }
    user.accountVerified = true;
    user.verificationCodeExpireAt = null;
    user.verificationCode = "";
    await user.save();
    res.json({ sucess: "true", message: "user verfied sucessfully" });
  } catch (error) {
    return next(createHttpError(500, `internal server error ${error.message}`));
  }
};

const isAuthauncated = (req, res) => {
  const { userId } = req.body;

  try {
    if (userId) {
      res.json({ sucess: true });
    }
  } catch (error) {
    res.json({ sucess: false, message: "Unauthorize" });
  }
};

const resetPasswordOtp = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await userModal.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPassword = generatedOtp;
    user.resetPasswordExpireAt = Date.now() + 7 * 60 * 1000;
    await user.save();

  
    const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password OTP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: 'Arial', sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .header {
      background-color: #4a90e2;
      color: white;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 20px 30px;
      color: #333333;
    }
    .otp-box {
      font-size: 28px;
      font-weight: bold;
      color: #4a90e2;
      background: #f0f4ff;
      padding: 15px 20px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
      letter-spacing: 4px;
    }
    .footer {
      background-color: #f4f6f8;
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>

    <div class="content">
      <h2>Hello, ${user.name}</h2>
      <p>
        We received a request to reset your password. Use the OTP below to reset your password.
        <strong>This OTP is valid for the next 2 minutes.</strong>
      </p>
      <div class="otp-box">${generatedOtp}</div>
      <p>If you did not request this password reset, you can safely ignore this email.</p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Auth-app. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
    const mailOption = {
      from: config.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      html: emailTemplate,
    };

    // Send email
    try {
      await transpoter.sendMail(mailOption);
    } catch (error) {
      return next(createHttpError(500, "otp send nahi hua"));
    }

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return next(createHttpError(500, "Something went wrong while sending OTP"));
  }
};


const verifyResetPassword = async (req, res) => {
  const { otp, userId, password } = req.body;
  try {
    const user = await userModal.findById(userId);
    if (user.resetPassword !== otp) {
      res.json({ sucess: false, message: "invalid otp" });
    }

    if (user.resetPasswordExpireAt < Date.now()) {
      res.json({
        sucess: false,
        message: "plese try again otp timeLimit exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user.password = hashPassword;
    user.resetPassword = "";
    user.resetPasswordExpireAt = null;

    await user.save();
    res.json({ sucess: "true", message: "password changed sucessfully" });
  } catch (error) {
    return next(createHttpError(500, `internal server error ${error}`));
  }
};

export {
  logout,
  logInUser,
  registerUser,
  sendOtp,
  isAuthauncated,
  verifyOtp,
  resetPasswordOtp,
  verifyResetPassword,
};
