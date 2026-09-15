import { Resend } from "resend";
import AppError from "./AppError.js";
import logger from "./logger.js";

const requiredEnv = ["RESEND_API_KEY", "EMAIL_FROM"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new AppError(
      `Missing required email configuration: ${key}`,
      500,
      "EMAIL_CONFIGURATION_ERROR",
    );
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Verify that the Resend API configuration is available.
 *
 * Unlike SMTP/Nodemailer, there is no persistent SMTP connection
 * to verify. The API key is validated when an email is sent.
 */
export const verifyEmailConnection = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing");
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error("EMAIL_FROM is missing");
    }

    logger.info("Resend email service configured successfully");

    return true;
  } catch (error) {
    logger.error("Email service configuration failed", {
      message: error.message,
    });

    throw new AppError(
      "Unable to connect to email service.",
      503,
      "EMAIL_SERVER_UNAVAILABLE",
    );
  }
};

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
  attempts = 3,
}) => {
  if (!to) {
    throw new AppError(
      "Email recipient is required.",
      400,
      "EMAIL_RECIPIENT_REQUIRED",
    );
  }

  if (!subject) {
    throw new AppError(
      "Email subject is required.",
      400,
      "EMAIL_SUBJECT_REQUIRED",
    );
  }

  if (!text && !html) {
    throw new AppError(
      "Email must contain text or HTML content.",
      400,
      "EMAIL_CONTENT_REQUIRED",
    );
  }

  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        ...(text && { text }),
        ...(html && { html }),
        ...(replyTo && { replyTo }),
      });

      if (error) {
        throw error;
      }

      logger.info("Email sent successfully", {
        messageId: data?.id,
        to,
        subject,
        attempt,
      });

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      lastError = error;

      logger.warn("Email sending attempt failed", {
        to,
        subject,
        attempt,
        attempts,
        message: error.message,
        name: error.name,
      });

      if (attempt === attempts) {
        break;
      }

      const backoffMs = 1000 * Math.pow(2, attempt - 1);

      logger.info(`Retrying email in ${backoffMs}ms...`);

      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  logger.error("Email sending failed after all retries", {
    to,
    subject,
    message: lastError?.message,
    name: lastError?.name,
  });

  throw new AppError(
    "Unable to send email. Please try again later.",
    503,
    "EMAIL_SEND_FAILED",
  );
};

export default sendEmail;
