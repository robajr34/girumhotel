import crypto from "crypto";

const generateBookingId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  const id = `BK-${year}-${random}`;
  return id;
};

export default generateBookingId;
