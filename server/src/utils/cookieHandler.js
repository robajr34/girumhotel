import env from "../configs/env.js";

const sendCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv,
    maxAge: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
};

export default sendCookie
