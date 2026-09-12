import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    dateOfBirth: {
      type: Date,
    },

    nationality: {
      type: String,
      trim: true,
      default: "Ethiopian",
    },

    address: {
      type: String,
      trim: true,
      required: true,
    },

    idType: {
      type: String,
      enum: ["passport", "national_id", "driving_license", "other"],
      default: "national_id",
    },

    idNumber: {
      type: String,
      trim: true,
      default: null
    },

    emergencyContactName: {
      type: String,
      trim: true,
      default: null,
    },

    emergencyContactPhone: {
      type: String,
      trim: true,
      default: null,
    },
    totalBookings: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
