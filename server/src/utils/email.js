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
  // ❌ REMOVED: family: 4 (allows both IPv4 and IPv6)

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  tls: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false, // ⚠️ Only for development/debugging
  },

  connectionTimeout: 15_000, // Increased from 10s
  greetingTimeout: 15_000,
  socketTimeout: 30_000, // Increased from 20s

  pool: true,
  maxConnections: 3, // Reduced from 5
  maxMessages: 50, // Reduced from 100
});

// Add connection verification on startup
transporter.on("error", (err) => {
  logger.error("Email transporter error", {
    code: err.code,
    message: err.message,
    command: err.command,
  });
});

transporter.on("idle", () => {
  logger.debug("Email transporter idle");
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const retryableCodes = [
    "ECONNECTION",
    "ETIMEDOUT",
    "ESOCKET",
    "ECONNRESET",
    "EAI_AGAIN",
    "ENOTFOUND",
  ];

  const retryableResponseCodes = [421, 450, 451, 452];

  return (
    retryableCodes.includes(error.code) ||
    retryableResponseCodes.includes(error.responseCode)
  );
};

export const verifyEmailConnection = async () => {
  try {
    logger.info("Verifying email server connection", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
    });

    await transporter.verify();
    logger.info("✅ Email server connection verified");
    return true;
  } catch (error) {
    logger.error("❌ Email server connection failed", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      code: error.code,
      responseCode: error.responseCode,
      message: error.message,
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
        responseCode: error.responseCode,
        message: error.message,
        command: error.command,
      });

      if (!isRetryableError(error) || attempt === attempts) {
        break;
      }

      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      logger.info(`Retrying email in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }
  }

  logger.error("❌ Email sending failed after all retries", {
    to,
    subject,
    code: lastError?.code,
    responseCode: lastError?.responseCode,
    message: lastError?.message,
  });

  throw new AppError(
    "Unable to send email. Please try again later.",
    503,
    "EMAIL_SEND_FAILED",
  );
};

export default sendEmail;
