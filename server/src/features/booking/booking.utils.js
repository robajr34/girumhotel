import generateBookingId from "../../utils/id.js";
import bookingIdRepo from "./id.repository.js";

export const generateUniqueId = async (maxAttempts = 100) => {
  let attempts = 0;
  let exists = true;
  let newId;

  while (exists && attempts < maxAttempts) {
    newId = generateBookingId();
    const found = await bookingIdRepo.findByBookingId(newId);
    exists = !!found;
    attempts++;
  }

  if (exists) {
    throw new Error(
      "Failed to generate unique booking ID after maximum attempts",
    );
  }

  return newId;
};
