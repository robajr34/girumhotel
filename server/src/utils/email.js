import nodemailer from "nodemailer";
import AppError from "./AppError.js";
import logger from "./logger.js";

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "EMAIL_FROM",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new AppError(
      `Missing required email configuration: ${key}`,
      500,
      "EMAIL_CONFIGURATION_ERROR",
    );
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info("✅ Email SMTP connection verified", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
    });
    return true;
  } catch (error) {
    logger.error("❌ Email SMTP connection failed", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      error: error.message,
    });
    throw new AppError(
      "Unable to connect to email server.",
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
      logger.info(`📧 Sending email (attempt ${attempt}/${attempts})`, {
        to,
        subject,
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
        ...(replyTo && { replyTo }),
      });

      logger.info("✅ Email sent successfully", {
        messageId: info.messageId,
        to,
        subject,
        attempt,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      lastError = error;

      logger.warn("⚠️ Email sending attempt failed", {
        to,
        subject,
        attempt,
        attempts,
        code: error.code,
        message: error.message,
      });

      // Permanent authentication errors - don't retry
      if (
        error.message?.includes("Invalid login") ||
        error.message?.includes("username and password not accepted") ||
        error.code === "EAUTH"
      ) {
        logger.error("❌ SMTP authentication failed - check credentials", {
          user: process.env.SMTP_USER,
          host: process.env.SMTP_HOST,
        });
        break;
      }

      if (attempt < attempts) {
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        logger.info(`Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
      }
    }
  }

  logger.error("❌ Email sending failed after all retries", {
    to,
    subject,
    lastError: lastError?.message,
  });

  throw new AppError(
    "Unable to send email. Please try again later.",
    503,
    "EMAIL_SEND_FAILED",
  );
};

export default sendEmail;
