import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

//import modules
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import roomRouter from "./features/room/room.route.js";
import authRouter from "./features/auth/auth.route.js";
import env from "./configs/env.js";
import userRouter from "./features/user/user.route.js";
import staffRouter from "./features/staff/staff.route.js";
import menuRouter from "./features/menu/menu.route.js";
import guestRouter from "./features/guest/guest.route.js";
import httpLogger from "./middlewares/httpLogger.js";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
import bookingRouter from "./features/booking/booking.route.js";
import docsRouter from "./docs/docs.route.js";

const app = express();

app.use(apiRateLimiter);
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(httpLogger)
// Routes
app.use("/api/rooms", roomRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/staffs", staffRouter);
app.use("/api/menus", menuRouter);
app.use("/api/guests", guestRouter);
app.use("/api/bookings", bookingRouter)
app.use("/docs", docsRouter);


app.use("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy.",
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
