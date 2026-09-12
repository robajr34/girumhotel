import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error("Request failed", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode,
    error: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: statusCode === 500 ? "Internal server error" : err.message,
    },
  });
};

export default errorHandler;
