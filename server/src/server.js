import "dotenv/config";
import app from "./app.js";
import connectDB from "./configs/db.js";
import env from "./configs/env.js";

const PORT = env.port;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
