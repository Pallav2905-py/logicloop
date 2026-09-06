import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_uri_here') {
    console.warn('[MongoDB] MONGODB_URI not configured. Operating in in-memory mode.');
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    console.error('[MongoDB] Connection error, operating in in-memory mode:', err.message);
    cached.promise = null;
    return null;
  }
}
