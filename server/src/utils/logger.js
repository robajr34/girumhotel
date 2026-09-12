const logger = {
  info(message, meta = {}) {
    console.log(`[${new Date().toISOString()}] [INFO]`, message, meta);
  },

  warn(message, meta = {}) {
    console.warn(`[${new Date().toISOString()}] [WARN]`, message, meta);
  },

  error(message, meta = {}) {
    console.error(`[${new Date().toISOString()}] [ERROR]`, message, meta);
  },
};

export default logger;
