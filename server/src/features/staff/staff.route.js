import { Router } from "express";

import {
  createStaff,
  getAllStaff,
  getStaffById,
  getMyStaffProfile,
  getStaffByRole,
  updateStaff,
  updateMyStaffProfile,
  deleteStaff,
} from "./staff.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { permit } from "../../middlewares/authorize.js";
import validate from "../../middlewares/validator.js";
import {
  createStaffValidator,
  updateMyStaffProfileValidator,
  updateStaffValidator,
} from "./staff.validator.js";

const staffRouter = Router();

staffRouter.get(
  "/me",
  authenticate,
  permit("owner", "manager", "receptionist"),
  getMyStaffProfile,
);

staffRouter.patch(
  "/me",
  authenticate,
  permit("owner", "manager", "receptionist"),
  validate(updateMyStaffProfileValidator),
  updateMyStaffProfile,
);

// Create staff
staffRouter.post(
  "/",
  authenticate,
  permit("owner", "manager"),
  validate(createStaffValidator),
  createStaff,
);

// Get all staff
staffRouter.get("/", authenticate, permit("owner", "manager"), getAllStaff);

// Get staff by role
staffRouter.get(
  "/role/:role",
  authenticate,
  permit("owner", "manager"),
  getStaffByRole,
);

// Get staff by ID
staffRouter.get(
  "/:staffId",
  authenticate,
  permit("owner", "manager"),
  getStaffById,
);

// Update staff
staffRouter.patch(
  "/:staffId",
  authenticate,
  permit("owner", "manager"),
  validate(updateStaffValidator),
  updateStaff,
);

// Delete staff
staffRouter.delete("/:staffId", authenticate, permit("owner"), deleteStaff);

export default staffRouter;
