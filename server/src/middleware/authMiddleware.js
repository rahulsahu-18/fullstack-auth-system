import jwt from "jsonwebtoken";
import config from "../config/envConfig.js";
import createHttpError from "http-errors";

const isAuthorize = async (req, res, next) => {
  const { token } = req.cookies;
  try {
  if (!token) {
  return res.status(401).json({ success: false, message: "Not Authorized, Login First" });
}
    const tokenData = jwt.verify(token, config.JWT_TOKEN);
    req.body.userId = tokenData.id;
    next();
  } catch (error) {
    return next(createHttpError(500, `internal server error ${error}`));
  }
};

export default isAuthorize;
