import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRevoked: {
      type: Boolean,
      dedault: false,
    },
    expiresAt: {
      type: Date,
      required:true,
    },
  },
  {
    timestamps: true,
  },
);

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
