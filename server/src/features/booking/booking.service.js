import AppError from "../../utils/AppError.js";
import logger from "../../utils/logger.js";
import bookingRepo from "./booking.repository.js";
import roomRepo from "../room/room.repository.js";
import guestRepo from "../guest/guest.repository.js";
import userRepo from "../user/user.repository.js";
import { generateUniqueId } from "./booking.utils.js";

const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed", "checked_in"];

export const createBookingService = async ({ userId, data }) => {
  const {
    guest,
    roomId,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    currency = "ETB",
    specialRequests,
  } = data;

  // 1. Validate dates
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    throw new AppError(
      "Invalid check-in or check-out date.",
      400,
      "INVALID_DATE",
    );
  }

  if (checkOut <= checkIn) {
    throw new AppError(
      "Check-out date must be after check-in date.",
      400,
      "INVALID_DATE_RANGE",
    );
  }

  // 2. Find room
  const room = await roomRepo.findById(roomId);

  if (!room) {
    logger.warn("Booking creation failed: room not found", {
      roomId,
      userId,
    });

    throw new AppError("Room not found.", 404, "ROOM_NOT_FOUND");
  }

  // 3. Check room status
  if (room.status !== "available") {
    logger.warn("Booking creation failed: room unavailable", {
      roomId,
      status: room.status,
      userId,
    });

    throw new AppError(
      "Room is not available for booking.",
      409,
      "ROOM_NOT_AVAILABLE",
    );
  }

  // 4. Validate guest data
  if (!guest) {
    throw new AppError("Guest information is required.", 400, "GUEST_REQUIRED");
  }

  // 5. Find existing guest
  let guestExist = null;

  if (guest.phone) {
    guestExist = await guestRepo.findByPhone(guest.phone);
  }

  // 6. Create guest if they don't exist
  if (!guestExist) {
    logger.info("Guest not found. Creating new guest.", {
      phone: guest.phone,
      userId,
    });

    guestExist = await guestRepo.create({
      user: userId,
      firstName: guest.firstName,
      lastName: guest.lastName,
      phone: guest.phone,
      country: guest.country || "Ethiopia",
      address: "Fiche",
    });
  }

  // 7. Check room capacity
  if (room.capacity && numberOfGuests > room.capacity) {
    throw new AppError(
      `Room can accommodate a maximum of ${room.capacity} guests.`,
      400,
      "ROOM_CAPACITY_EXCEEDED",
    );
  }

  // 8. Check overlapping bookings
  const overlappingBooking = await bookingRepo.findOverlappingBooking({
    roomId,
    checkInDate: checkIn,
    checkOutDate: checkOut,
  });

  if (overlappingBooking) {
    logger.warn("Booking creation failed: room already booked", {
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      userId,
    });

    throw new AppError(
      "Room is already booked for the selected dates.",
      409,
      "ROOM_ALREADY_BOOKED",
    );
  }

  // 9. Calculate number of nights
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const numberOfNights = Math.ceil((checkOut - checkIn) / millisecondsPerDay);

  // 10. Calculate total price on the server
  const totalPrice = numberOfNights * room.pricePerNight;

  // 11. Generate booking number
  const bookingNumber = await generateUniqueId();

  // 12. Create booking
  let booking;

  try {
    booking = await bookingRepo.create({
      bookingNumber,
      guest: guestExist._id,
      room: roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      status: "pending",
      totalPrice,
      currency,
      specialRequests,
      createdBy: userId,
    });
  } catch (err) {
    logger.error("Booking creation failed", {
      userId,
      roomId,
      guestId: guestExist._id,
      error: err.message,
      stack: err.stack,
    });

    throw err;
  }

  // 13. Update guest booking count AFTER successful booking creation
  try {
    const totalBookings = await bookingRepo.count({
      guest: guestExist._id,
    });

    await guestRepo.updateById(guestExist._id, {
      totalBookings,
    });
  } catch (err) {
    logger.error("Failed to update guest booking count", {
      guestId: guestExist._id,
      bookingId: booking._id,
      error: err.message,
      stack: err.stack,
    });

    // Do not fail the booking because the denormalized count failed.
    // The count can be repaired later from the bookings collection.
  }

  logger.info("Booking created successfully", {
    bookingId: booking._id,
    bookingNumber: booking.bookingNumber,
    guestId: guestExist._id,
    roomId,
    createdBy: userId,
    totalPrice,
    numberOfNights,
  });

  return booking;
};

export const getBookingService = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    logger.warn("Booking retrieval failed: booking not found", {
      bookingId,
    });

    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  return booking;
};

export const getBookingByNumberService = async (bookingNumber) => {
  const booking = await bookingRepo.findByBookingNumber(bookingNumber);

  if (!booking) {
    logger.warn("Booking retrieval failed: booking number not found", {
      bookingNumber,
    });

    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  return booking;
};

export const getAllBookingsService = async (query = {}) => {
  const {
    page = 1,
    limit = 15,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    guest,
    room,
    createdBy,
  } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (guest) {
    filter.guest = guest;
  }

  if (room) {
    filter.room = room;
  }

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  const result = await bookingRepo.findAll(
    {
      page,
      limit,
      sortBy,
      sortOrder,
    },
    filter,
  );

  logger.info("Bookings retrieved successfully", {
    page,
    limit,
    total: result.meta.total,
  });

  return result;
};

export const getGuestBookingsService = async (guestId, query = {}) => {
  const result = await bookingRepo.findByGuest(guestId, query);

  logger.info("Guest bookings retrieved successfully", {
    guestId,
    total: result.meta.total,
  });

  return result;
};

export const updateBookingService = async (bookingId, data) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  if (["checked_out", "cancelled"].includes(booking.status)) {
    throw new AppError(
      `Cannot update a ${booking.status === "checked_out" ? "checked out" : booking.status} booking.`,
      400,
      "BOOKING_CANNOT_BE_UPDATED",
    );
  }

  const updatedBooking = await bookingRepo.updateById(bookingId, data);

  logger.info("Booking updated successfully", {
    bookingId,
  });

  return updatedBooking;
};

export const confirmBookingService = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.status !== "pending") {
    throw new AppError(
      "Only pending bookings can be confirmed.",
      400,
      "INVALID_BOOKING_STATUS",
    );
  }

  const updatedBooking = await bookingRepo.updateById(bookingId, {
    status: "confirmed",
  });

  logger.info("Booking confirmed successfully", {
    bookingId,
  });

  return updatedBooking;
};

export const checkInBookingService = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.status !== "confirmed") {
    throw new AppError(
      "Only confirmed bookings can be checked in.",
      400,
      "INVALID_BOOKING_STATUS",
    );
  }

  const updatedBooking = await bookingRepo.updateById(bookingId, {
    status: "checked_in",
    checkedInAt: new Date(),
  });
  await roomRepo.updateById(booking.room, { status: "occupied" });
  logger.info("Guest checked in successfully", {
    bookingId,
    guestId: booking.guest?._id || booking.guest,
    roomId: booking.room?._id || booking.room,
  });

  return updatedBooking;
};

export const checkOutBookingService = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  if (booking.status !== "checked_in") {
    throw new AppError(
      "Only checked-in bookings can be checked out.",
      400,
      "INVALID_BOOKING_STATUS",
    );
  }

  const updatedBooking = await bookingRepo.updateById(bookingId, {
    status: "checked_out",
    checkedOutAt: new Date(),
  });

  await roomRepo.updateById(booking.room, { status: "available" });

  logger.info("Guest checked out successfully", {
    bookingId,
    guestId: booking.guest?._id || booking.guest,
    roomId: booking.room?._id || booking.room,
  });

  return updatedBooking;
};

export const cancelBookingService = async (bookingId) => {
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  if (["checked_out", "cancelled"].includes(booking.status)) {
    throw new AppError(
      `Cannot cancel a ${booking.status === "checked_out" ? "checked out" : booking.status} booking.`,
      400,
      "BOOKING_CANNOT_BE_CANCELLED",
    );
  }

  const updatedBooking = await bookingRepo.updateById(bookingId, {
    status: "cancelled",
    cancelledAt: new Date(),
  });

  logger.info("Booking cancelled successfully", {
    bookingId,
  });

  return updatedBooking;
};

export const deleteBookingService = async (bookingId) => {
  // 1. Find the actual booking document
  const booking = await bookingRepo.findById(bookingId);

  if (!booking) {
    logger.warn("Booking deletion failed: booking not found", {
      bookingId,
    });

    throw new AppError("Booking not found.", 404, "BOOKING_NOT_FOUND");
  }

  // 2. Keep the guest ID before deleting the booking
  const guestId = booking.guest?._id || booking.guest;

  // 3. Delete booking
  try {
    await bookingRepo.deleteById(bookingId);
  } catch (err) {
    logger.error("Booking deletion failed", {
      bookingId,
      error: err.message,
      stack: err.stack,
    });

    throw new AppError("Error deleting booking.", 500, "INTERNAL_SERVER_ERROR");
  }

  // 4. Recalculate guest booking count after successful deletion
  if (guestId) {
    try {
      const totalBookings = await bookingRepo.count({
        guest: guestId,
      });

      await guestRepo.updateById(guestId, {
        totalBookings,
      });
    } catch (err) {
      logger.error("Failed to update guest booking count after deletion", {
        guestId,
        bookingId,
        error: err.message,
        stack: err.stack,
      });

      // Booking was already successfully deleted.
      // Do not report deletion as failed because only the denormalized
      // guest count update failed.
    }
  }

  logger.info("Booking deleted successfully", {
    bookingId,
    bookingNumber: booking.bookingNumber,
    guestId,
  });

  return booking;
};
