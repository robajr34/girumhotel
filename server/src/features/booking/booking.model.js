import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
      index: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    checkInDate: {
      type: Date,
      required: true,
      index: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
      index: true,
    },

    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"],
      default: "pending",
      index: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["ETB", "USD"],
      default: "ETB",
    },

    specialRequests: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    cancelledAt: {
      type: Date,
    },

    checkedInAt: {
      type: Date,
    },

    checkedOutAt: {
      type: Date,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({
  room: 1,
  checkInDate: 1,
  checkOutDate: 1,
});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
