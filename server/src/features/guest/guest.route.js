import { Router } from "express";

import {
  createGuest,
  updateGuest,
  getGuest,
  getAllGuests,
} from "./guest.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import validate from "../../middlewares/validator.js";

import {
  createGuestValidator,
  updateGuestValidator,
} from "./guest.validator.js";
import { permit } from "../../middlewares/authorize.js";

const guestRouter = Router();

guestRouter.use(authenticate);

// Get all guests
guestRouter.get("/", permit("owner", "manager"), getAllGuests);

// Get one guest
guestRouter.get("/:guestId", getGuest);

// Create guest
guestRouter.post("/", validate(createGuestValidator), createGuest);

// Update guest
guestRouter.patch(
  "/:guestId",
  validate(updateGuestValidator),
  permit("owner", "guest"),
  updateGuest,
);

export default guestRouter;
