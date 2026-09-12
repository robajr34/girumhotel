import { Router } from "express";

import {
  createBooking,
  getBooking,
  getBookingByNumber,
  getAllBookings,
  getGuestBookings,
  updateBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  cancelBooking,
  deleteBooking,
} from "./booking.controller.js";

import { authenticate } from "../../middlewares/authenticate.js";
import { permit } from "../../middlewares/authorize.js";
import validate from "../../middlewares/validator.js";
import {
  createBookingValidator,
  updateBookingValidator,
} from "./booking.validator.js";

const bookingRouter = Router();

// Create booking
bookingRouter.post(
  "/",
  authenticate,
  permit("owner", "guest", "receptionist", "manager"),
  validate(createBookingValidator),
  createBooking,
);

// Get all bookings
bookingRouter.get(
  "/",
  authenticate,
  permit("owner", "manager", "guest", "receptionist"),
  getAllBookings,
);

// Search booking by booking number
bookingRouter.get("/search", authenticate, getBookingByNumber);

// Get bookings belonging to a guest
bookingRouter.get("/guest/:guestId", authenticate, getGuestBookings);

// Get a single booking
bookingRouter.get("/:bookingId", authenticate, getBooking);

// Update booking
bookingRouter.patch(
  "/:bookingId",
  authenticate,
  validate(updateBookingValidator),
  updateBooking,
);

// Confirm booking
bookingRouter.patch(
  "/:bookingId/confirm",
  authenticate,
  permit("manager", "owner", "receptionist"),
  confirmBooking,
);

// Check in guest
bookingRouter.patch(
  "/:bookingId/check-in",
  authenticate,
  permit("manager", "owner", "receptionist"),
  checkInBooking,
);

// Check out guest
bookingRouter.patch(
  "/:bookingId/check-out",
  authenticate,
  permit("manager", "owner", "receptionist"),
  checkOutBooking,
);

// Cancel booking
bookingRouter.patch("/:bookingId/cancel", authenticate, cancelBooking);

// Delete booking
bookingRouter.delete(
  "/:bookingId",
  authenticate,
  permit("manager", "owner", "guest"),
  deleteBooking,
);

export default bookingRouter;
