import { Router } from "express";

import {
  completeSetup,
  guestLogin,
  guestSignup,
  refreshToken,
  setupOwner,
  setupStaff,
  verifyOwnerEmail,
  verifyStaffEmail,
} from "./auth.controller.js";

import validate from "../../middlewares/validator.js";

import {
  guestLoginValidator,
  guestSignupValidator,
} from "../user/user.validator.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { permit } from "../../middlewares/authorize.js";

import { createStaffValidator } from "../staff/staff.validator.js";

import { loginRateLimiter } from "../../middlewares/rateLimiter.js";

const authRouter = Router();

// Owner setup
authRouter.post("/setup/owner", setupOwner);

// Verify owner's email
authRouter.post("/setup/owner/verify-email", verifyOwnerEmail);

// Login
authRouter.post(
  "/login",
  loginRateLimiter,
  validate(guestLoginValidator),
  guestLogin,
);

// Guest signup
authRouter.post("/signup", validate(guestSignupValidator), guestSignup);

// Refresh access token
authRouter.post("/refresh", refreshToken);

// Owner creates a staff account
authRouter.post("/setup/staff", authenticate, permit("owner"), setupStaff);

// Verify staff email
authRouter.post("/setup/staff/verify-email", verifyStaffEmail);

// Complete staff setup
authRouter.post(
  "/setup/complete-setup",
  authenticate,
  permit("owner", "manager", "receptionist"),
  validate(createStaffValidator),
  completeSetup,
);

export default authRouter;
