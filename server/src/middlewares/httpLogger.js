import crypto from "crypto";
import logger from "../utils/logger.js";

const httpLogger = (req, res, next) => {
  const requestId = crypto.randomUUID();

  const start = Date.now();

  req.requestId = requestId;

  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("HTTP Request", {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

export default httpLogger;
