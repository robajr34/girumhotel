import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid menu ID.");

const menuCategory = z.enum([
  "breakfast",
  "lunch",
  "dinner",
  "meat",
  "beverage",
]);

export const createMenuValidator = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Menu name must be at least 2 characters.")
    .max(100, "Menu name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .optional(),

  price: z.coerce.number().min(0, "Price cannot be negative."),

  category: menuCategory,

  isAvailable: z.boolean().optional(),

  preparationTime: z.coerce
    .number()
    .int("Preparation time must be a whole number.")
    .min(0, "Preparation time cannot be negative.")
    .optional(),
});

export const updateMenuValidator = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Menu name must be at least 2 characters.")
      .max(100, "Menu name cannot exceed 100 characters.")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),

    price: z.coerce.number().min(0, "Price cannot be negative.").optional(),

    category: menuCategory.optional(),

    isAvailable: z.boolean().optional(),

    preparationTime: z.coerce
      .number()
      .int("Preparation time must be a whole number.")
      .min(0, "Preparation time cannot be negative.")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });
