import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["owner", "manager", "receptionist"],
      required: true,
      index: true,
    },

    joinedAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  },
);

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
