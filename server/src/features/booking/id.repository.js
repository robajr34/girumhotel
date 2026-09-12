import BookingId from "./id.model.js";

const bookingIdRepo = {
  create(data) {
    return BookingId.create(data);
  },
  findByBookingId(bookingId) {
    return BookingId.findOne({ bookingId });
  },
  deleteByBookingId(bookingId) {
    return BookingId.findOneAndDelete({ bookingId });
  },
};

export default bookingIdRepo