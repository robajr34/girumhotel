import mongoose from "mongoose";

const bookingIdSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

const BookingId = mongoose.model("BookingId", bookingIdSchema);
export default BookingId;
