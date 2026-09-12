import mongoose from "mongoose";
import AppError from "./AppError.js";

const validateId = (id) => {
  const isValid = mongoose.isValidObjectId(id);
  if (!isValid) {
    throw new AppError("Invalid ID.", 400, "INVALID_ID");
  }
  return id;
};

export default validateId
