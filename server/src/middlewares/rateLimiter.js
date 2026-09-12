import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 15,
  max: 10,

  message: { error: "Too many login attempts, please try again later." },

  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1000 * 60 * 1,
  max: 100,

  message: "Too many requests, please try again later.",

  standardHeaders: "draft-8",
  legacyHeaders: false,
});
