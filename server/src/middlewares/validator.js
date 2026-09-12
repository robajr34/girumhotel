import { ZodError } from "zod";

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);

      req.body = result;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      next(error);
    }
  };
};

export default validate;
