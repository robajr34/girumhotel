import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createGuestValidator = z.object({
  user: objectId,

  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long"),

  dateOfBirth: z.coerce.date().optional(),

  nationality: z
    .string()
    .trim()
    .max(50, "Nationality must not exceed 50 characters")
    .optional(),

  address: z
    .string()
    .trim()
    .max(200, "Address must not exceed 200 characters")
    .optional(),

  idType: z
    .enum(["passport", "national_id", "driving_license", "other"])
    .optional(),

  idNumber: z
    .string()
    .trim()
    .max(50, "ID number must not exceed 50 characters")
    .optional(),

  emergencyContactName: z
    .string()
    .trim()
    .max(100, "Emergency contact name must not exceed 100 characters")
    .optional(),

  emergencyContactPhone: z
    .string()
    .trim()
    .min(7, "Emergency contact phone is too short")
    .max(20, "Emergency contact phone is too long")
    .optional(),
});

export const updateGuestValidator = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters")
      .optional(),

    phone: z
      .string()
      .trim()
      .min(7, "Phone number is too short")
      .max(20, "Phone number is too long")
      .optional(),

    dateOfBirth: z.coerce.date().optional(),

    nationality: z
      .string()
      .trim()
      .max(50, "Nationality must not exceed 50 characters")
      .optional(),

    address: z
      .string()
      .trim()
      .max(200, "Address must not exceed 200 characters")
      .optional(),

    idType: z
      .enum(["passport", "national_id", "driving_license", "other"])
      .optional(),

    idNumber: z
      .string()
      .trim()
      .max(50, "ID number must not exceed 50 characters")
      .optional(),

    emergencyContactName: z
      .string()
      .trim()
      .max(100, "Emergency contact name must not exceed 100 characters")
      .optional(),

    emergencyContactPhone: z
      .string()
      .trim()
      .min(7, "Emergency contact phone is too short")
      .max(20, "Emergency contact phone is too long")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update a guest",
  });
