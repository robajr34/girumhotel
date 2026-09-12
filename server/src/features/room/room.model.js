import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      unique: true,
      trim: true,
    },

    type: {
      type: String,
      required: [true, "Room type is required"],
      enum: {
        values: ["single", "double", "family"],
        message: "Invalid room type",
      },
    },

    floor: {
      type: Number,
      required: [true, "Floor is required"],
      min: [0, "Floor cannot be negative"],
    },

    capacity: {
      type: Number,
      required: [true, "Room capacity is required"],
      min: [1, "Room capacity must be at least 1"],
    },

    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: [
          "available",
          "occupied",
          "cleaning",
          "maintenance",
          "inactive",
        ],
        message: "Invalid room status",
      },
      default: "available",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
