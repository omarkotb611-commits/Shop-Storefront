import mongoose, { type Mongoose } from "mongoose";

type MongooseCache = typeof globalThis & {
  mongooseConnection?: Promise<Mongoose>;
};

const globalForMongoose = globalThis as MongooseCache;

export async function connectDB(): Promise<Mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add the MongoDB Atlas connection string in Replit Secrets.",
    );
  }

  if (!globalForMongoose.mongooseConnection) {
    globalForMongoose.mongooseConnection = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }

  return globalForMongoose.mongooseConnection;
}
