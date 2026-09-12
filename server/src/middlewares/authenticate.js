import AppError from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/token.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError(
      "Authorization header not provided.",
      401,
      "AUTH_HEADER_NOT_PROVIDED",
    );
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError(
      "Invalid authorization format.",
      401,
      "INVALID_AUTH_HEADER",
    );
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(
        "Access token has expired.",
        401,
        "ACCESS_TOKEN_EXPIRED",
      );
    }

    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid access token.", 401, "INVALID_ACCESS_TOKEN");
    }

    throw error;
  }
};

