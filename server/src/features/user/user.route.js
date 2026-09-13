import { Router } from "express";

import {
  blockUser,
  deleteUser,
  getAllUsers,
  getMe,
  getUser,
} from "./user.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { permit } from "../../middlewares/authorize.js";

const userRouter = Router();

// Get all users
userRouter.get("/", authenticate, permit("owner", "manager"), getAllUsers);

userRouter.get("/me", authenticate, getMe);

// Get a single user
userRouter.get("/:userId", authenticate, getUser);

// Block a user
userRouter.patch(
  "/:userId/block",
  authenticate,
  permit("owner", "manager"),
  blockUser,
);

// Delete a user
userRouter.delete(
  "/:userId",
  authenticate,
  permit("owner", "manager"),
  deleteUser,
);

export default userRouter;
