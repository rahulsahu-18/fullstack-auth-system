import { config as conf } from "dotenv";
conf({ path: "./src/.env" });
const _config = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN,
  JWT_TOKEN: process.env.JWT_TOKEN,
  TYPE: process.env.type,
  SMPT_USER: process.env.SMPT_USER,
  SMPT_PASS: process.env.SMPT_PASS,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
};

const config = Object.freeze(_config);
export default config;
