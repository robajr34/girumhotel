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
  secure: false,
  family: 4,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  tls: {
    minVersion: "TLSv1.2",
  },

  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000,

  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) => {
  const retryableCodes = [
    "ECONNECTION",
    "ETIMEDOUT",
    "ESOCKET",
    "ECONNRESET",
    "EAI_AGAIN",
  ];

  const retryableResponseCodes = [421, 450, 451, 452];

  return (
    retryableCodes.includes(error.code) ||
    retryableResponseCodes.includes(error.responseCode)
  );
};

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();

    logger.info("Email server connection verified");

    return true;
  } catch (error) {
    logger.error("Email server connection failed", {
      code: error.code,
      responseCode: error.responseCode,
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
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
        ...(replyTo && { replyTo }),
      });

      logger.info("Email sent successfully", {
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

      logger.warn("Email sending attempt failed", {
        to,
        subject,
        attempt,
        attempts,
        code: error.code,
        responseCode: error.responseCode,
        error: error.message,
      });

      if (!isRetryableError(error) || attempt === attempts) {
        break;
      }

      await sleep(1000 * 2 ** (attempt - 1));
    }
  }

  logger.error("Email sending failed", {
    to,
    subject,
    code: lastError?.code,
    responseCode: lastError?.responseCode,
    error: lastError?.message,
  });

  throw new AppError(
    "Unable to send email. Please try again later.",
    503,
    "EMAIL_SEND_FAILED",
  );
};

export default sendEmail;
