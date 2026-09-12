import { z } from "zod";

export const newRoomValidator = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number is required")
    .max(10, "Room number is too long"),

  type: z.enum(["single", "double", "family"], {
    error: "Room type must be single, double, or family",
  }),

  pricePerNight: z.coerce
    .number()
    .positive("Price per night must be greater than 0"),

  floor: z.coerce
    .number()
    .int("Floor must be a whole number")
    .min(0, "Floor cannot be negative"),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0"),

  amenities: z
    .array(z.string().trim().min(1, "Amenity cannot be empty"))
    .default([]),

  status: z
    .enum(["available", "occupied", "maintenance", "cleaning", "inactive"])
    .default("available"),
});

export const updateRoomValidator = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Room number cannot be empty")
    .max(10, "Room number is too long")
    .optional(),

  type: z
    .enum(["single", "double", "family"], {
      error: "Room type must be single, double, or family",
    })
    .optional(),

  pricePerNight: z.coerce
    .number()
    .positive("Price per night must be greater than 0")
    .optional(),

  floor: z.coerce
    .number()
    .int("Floor must be a whole number")
    .min(0, "Floor cannot be negative")
    .optional(),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than 0")
    .optional(),

  amenities: z
    .array(z.string().trim().min(1, "Amenity cannot be empty"))
    .optional(),

  status: z
    .enum(["available", "occupied", "maintenance", "cleaning", "inactive"])
    .optional(),
});

export const updateRoomStatusValidator = z.object({
  status: z
    .enum(["available", "occupied", "maintenance", "cleaning"], {
        error: "Room status can only be available, occupied, maintenance, cleaning, inactive."
    })
});
