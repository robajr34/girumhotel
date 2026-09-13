import nodemailer from "nodemailer";
import AppError from "./AppError.js";
import logger from "./logger.js";

// Validate environment variables
const requiredEnv = ["SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new AppError(
      `Missing required email configuration: ${key}`,
      500,
      "EMAIL_CONFIGURATION_ERROR",
    );
  }
}

// Create transporter with proper timeout settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },

  // Timeout settings (in milliseconds)
  connectionTimeout: 10000, // 10 seconds to connect
  socketTimeout: 10000, // 10 seconds for socket operations

  // Connection pooling
  pool: {
    maxConnections: 1, // Use single connection (Gmail allows 1)
    maxMessages: 10, // Max messages per connection
    rateDelta: 1000, // Time between messages (1 second)
    rateLimit: 5, // Max 5 messages per rateDelta
  },
});

// Helper to sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Verify Gmail connection is working
 */
export const verifyEmailConnection = async () => {
  try {
    logger.info("Verifying Gmail connection...");
    await transporter.verify();
    logger.info("✅ Gmail connection verified successfully");
    return true;
  } catch (error) {
    logger.error("❌ Gmail connection verification failed", {
      error: error.message,
      code: error.code,
    });

    throw new AppError(
      "Unable to connect to Gmail. Check credentials.",
      503,
      "EMAIL_SERVER_UNAVAILABLE",
    );
  }
};

/**
 * Send email with retry logic and timeout handling
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
  replyTo,
  attempts = 3,
}) => {
  // Validation
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

  if (!html && !text) {
    throw new AppError(
      "Email must contain text or HTML content.",
      400,
      "EMAIL_CONTENT_REQUIRED",
    );
  }

  let lastError;

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      logger.info(`📧 Sending email (attempt ${attempt}/${attempts})`, {
        to,
        subject,
      });

      // Create promise that rejects after timeout
      const sendPromise = transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        ...(html && { html }),
        ...(text && { text }),
        ...(replyTo && { replyTo }),
      });

      // Wrap with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Email send timeout (15s)")),
          15000, // 15 second timeout
        ),
      );

      const info = await Promise.race([sendPromise, timeoutPromise]);

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
        error: error.message,
        code: error.code,
      });

      // Don't retry on permanent errors
      if (
        error.message.includes("Invalid login") ||
        error.message.includes("Invalid credentials") ||
        error.message.includes("authentication failed")
      ) {
        logger.error("❌ Authentication error - not retrying");
        break;
      }

      // Wait before retry (exponential backoff: 2s, 4s, 8s)
      if (attempt < attempts) {
        const backoffMs = 1000 * Math.pow(2, attempt - 1);
        logger.info(`Retrying in ${backoffMs}ms...`);
        await sleep(backoffMs);
      }
    }
  }

  // All attempts failed
  logger.error("❌ Email sending failed after all retries", {
    to,
    subject,
    attempts,
    lastError: lastError?.message,
  });

  throw new AppError(
    "Unable to send email. Please try again later.",
    503,
    "EMAIL_SEND_FAILED",
  );
};

export default sendEmail;
