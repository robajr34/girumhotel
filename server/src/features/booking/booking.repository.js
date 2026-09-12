import Booking from "./booking.model.js";

const bookingRepo = {
  create(data) {
    return Booking.create(data);
  },

  findAll(query = {}, filter = {}) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(query.limit) || 15, 1), 100);
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const sort = {
      [sortBy]: sortOrder,
    };

    return Promise.all([
      Booking.find(filter)
        .populate("guest")
        .populate("room")
        .populate("createdBy")
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Booking.countDocuments(filter),
    ]).then(([bookings, total]) => ({
      bookings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    }));
  },

  findById(bookingId) {
    return Booking.findById(bookingId)
      .populate("guest")
      .populate("room")
      .populate("createdBy");
  },

  findByBookingNumber(bookingNumber) {
    return Booking.findOne({ bookingNumber })
      .populate("guest")
      .populate("room")
      .populate("createdBy");
  },

  findByGuest(guestId, query = {}) {
    return this.findAll(query, { guest: guestId });
  },

  findByRoom(roomId, query = {}) {
    return this.findAll(query, { room: roomId });
  },

  findByCreatedBy(userId, query = {}) {
    return this.findAll(query, { createdBy: userId });
  },

  findOne(filter = {}) {
    return Booking.findOne(filter);
  },

  findOneByGuest(guestId) {
    return Booking.findOne({ guest: guestId });
  },

  findOverlappingBooking({ roomId, checkInDate, checkOutDate }) {
    return Booking.findOne({
      room: roomId,

      status: {
        $nin: ["cancelled"],
      },

      checkInDate: {
        $lt: checkOutDate,
      },

      checkOutDate: {
        $gt: checkInDate,
      },
    });
  },

  updateById(bookingId, updatedData) {
    return Booking.findByIdAndUpdate(bookingId, updatedData, {
      returnDocument: "after",
      runValidators: true,
    })
      .populate("guest")
      .populate("room")
      .populate("createdBy");
  },

  deleteById(bookingId) {
    return Booking.findByIdAndDelete(bookingId);
  },

  count(filter = {}) {
    return Booking.countDocuments(filter);
  },

  exists(filter = {}) {
    return Booking.exists(filter);
  },
};

export default bookingRepo;
