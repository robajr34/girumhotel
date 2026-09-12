const env = {
  port: process.env.PORT || 5000,

  nodeEnv: process.env.NODE_ENV || "development",

  frontendUrl: process.env.FRONTEND_URL,

  mongodbUri: process.env.MONGO_URI,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};

export default env;
