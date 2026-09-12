import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../configs/env.js";

export const generateAccessToken = (data) => {
  return jwt.sign(
    {
      userId: data.userId,
      role: data.role,
      accountType: data.accountType,
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn },
  );
};
export const generateRefreshToken = (data) => {
  return jwt.sign(
    {
      userId: data.userId,
      role: data.role,
      accountType: data.accountType,
    },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn },
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwt.refreshSecret);
};
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.accessSecret);
};

export const generateBothTokens = (data) => {
  const accessToken = generateAccessToken(data);
  const refreshToken = generateRefreshToken(data);
  return { accessToken, refreshToken };
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const compareToken = (token, hashedToken) => {
  const newHash = crypto.createHash("sha256").update(token).digest("hex");
  const isMatch = newHash === hashedToken;
  return isMatch;
};

export const generateToken = () => crypto.randomBytes(32).toString("hex");
