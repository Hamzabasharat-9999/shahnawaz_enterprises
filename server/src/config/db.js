import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not configured. The API will run, but database features will be unavailable.');
    return false;
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
  return true;
}
