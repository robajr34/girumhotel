import mongoose from 'mongoose';
import env from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.log('DB Error:', err.message);
    process.exit(1);
  }
};
export default connectDB