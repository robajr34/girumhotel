import { z } from "zod";

export const guestSignupValidator = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),
});

export const guestLoginValidator = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .transform((email) => email.toLowerCase()),

  password: z.string().min(1, "Password is required"),
});