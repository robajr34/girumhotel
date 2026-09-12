import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID.");

const staffRoles = [
  "owner",
  "manager",
  "receptionist",
  "housekeeper",
  "accountant",
  "chef",
  "waiter",
];

const staffRole = z.enum(staffRoles);

// ─────────────────────────────────────────────
// CREATE STAFF
// POST /staff
// ─────────────────────────────────────────────

export const createStaffValidator = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name cannot exceed 50 characters."),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name cannot exceed 50 characters."),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is invalid.")
    .max(20, "Phone number is invalid."),
});

// ─────────────────────────────────────────────
// UPDATE STAFF
// PATCH /staff/:staffId
// ─────────────────────────────────────────────

export const updateStaffValidator = z.object({
      firstName: z.string().trim().min(2).max(50).optional(),

      lastName: z.string().trim().min(2).max(50).optional(),

      phone: z.string().trim().min(7).max(20).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required.",
    })

// ─────────────────────────────────────────────
// UPDATE MY STAFF PROFILE
// PATCH /staff/me
// ─────────────────────────────────────────────

export const updateMyStaffProfileValidator = z.object({
      firstName: z.string().trim().min(2).max(50).optional(),

      lastName: z.string().trim().min(2).max(50).optional(),

      phone: z.string().trim().min(7).max(20).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required.",
    })
