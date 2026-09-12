import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid room ID.",
  });

export const createBookingValidator = z
  .object({
    guest: z.object({
      firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters.")
        .max(50),

      lastName: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters.")
        .max(50),

      phone: z.string().trim().min(9, "Phone number is required.").max(20),

      country: z.string().trim().min(2).max(50).optional(),
    }),

    roomId: objectId,

    checkInDate: z.coerce.date({
      message: "Invalid check-in date.",
    }),

    checkOutDate: z.coerce.date({
      message: "Invalid check-out date.",
    }),

    numberOfGuests: z
      .number({
        message: "Number of guests must be a number.",
      })
      .int()
      .min(1, "At least one guest is required.")
      .max(20, "Number of guests cannot exceed 20."),

    currency: z.enum(["ETB", "USD"]).default("ETB"),

    specialRequests: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date.",
    path: ["checkOutDate"],
  });

export const updateBookingValidator = z.object({
  checkInDate: z.coerce.date().optional(),

  checkOutDate: z.coerce.date().optional(),

  numberOfGuests: z.number().int().min(1).max(20).optional(),

  specialRequests: z.string().trim().max(500).optional(),
});
