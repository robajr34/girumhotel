import AppError from "../../utils/AppError.js";
import sendResponse from "../../utils/responseHandler.js";
import validateId from "../../utils/validateId.js";

import {
  cancelBookingService,
  checkInBookingService,
  checkOutBookingService,
  confirmBookingService,
  createBookingService,
  deleteBookingService,
  getAllBookingsService,
  getBookingByNumberService,
  getBookingService,
  getGuestBookingsService,
  updateBookingService,
} from "./booking.service.js";

export const createBooking = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError("User authentication is required.", 401, "UNAUTHORIZED");
  }

  const booking = await createBookingService({
    userId,
    data: req.body,
  });

  return sendResponse(res, 201, "Booking created successfully.", booking);
};

// GET /api/bookings/:bookingId
export const getBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await getBookingService(bookingId);

  return sendResponse(res, 200, "Booking retrieved successfully.", booking);
};

// GET /api/bookings/search?bookingNumber=...
export const getBookingByNumber = async (req, res) => {
  const { bookingNumber } = req.query;

  const booking = await getBookingByNumberService(bookingNumber);

  return sendResponse(res, 200, "Booking retrieved successfully.", booking);
};

// GET /api/bookings
export const getAllBookings = async (req, res) => {
  const result = await getAllBookingsService(req.query);

  return sendResponse(res, 200, "Bookings retrieved successfully.", result);
};

// GET /api/bookings/guest/:guestId
export const getGuestBookings = async (req, res) => {
  const guestId = validateId(req.params.guestId);

  const result = await getGuestBookingsService(guestId, req.query);

  return sendResponse(
    res,
    200,
    "Guest bookings retrieved successfully.",
    result,
  );
};

// PATCH /api/bookings/:bookingId
export const updateBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await updateBookingService(bookingId, req.body);

  return sendResponse(res, 200, "Booking updated successfully.", booking);
};

// PATCH /api/bookings/:bookingId/confirm
export const confirmBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await confirmBookingService(bookingId);

  return sendResponse(res, 200, "Booking confirmed successfully.", booking);
};

// PATCH /api/bookings/:bookingId/check-in
export const checkInBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await checkInBookingService(bookingId);

  return sendResponse(res, 200, "Guest checked in successfully.", booking);
};

// PATCH /api/bookings/:bookingId/check-out
export const checkOutBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await checkOutBookingService(bookingId);

  return sendResponse(res, 200, "Guest checked out successfully.", booking);
};

// PATCH /api/bookings/:bookingId/cancel
export const cancelBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await cancelBookingService(bookingId);

  return sendResponse(res, 200, "Booking cancelled successfully.", booking);
};

// DELETE /api/bookings/:bookingId
export const deleteBooking = async (req, res) => {
  const bookingId = validateId(req.params.bookingId);

  const booking = await deleteBookingService(bookingId);

  return sendResponse(res, 200, "Booking deleted successfully.", booking);
};
