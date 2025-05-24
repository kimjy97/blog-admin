import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cachedMongoose = global.mongooseConnection;

if (!cachedMongoose) {
  cachedMongoose = global.mongooseConnection = { conn: null, promise: null };
}

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Mongoose를 사용하여 MongoDB에 연결하는 함수
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (!cachedMongoose) {
    cachedMongoose = { conn: null, promise: null };
  }

  if (cachedMongoose.conn) {
    return cachedMongoose.conn;
  }

  if (!cachedMongoose.promise) {
    const opts = {
      bufferCommands: true,
    };
    cachedMongoose.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cachedMongoose.conn = await cachedMongoose.promise;
  } catch (e) {
    cachedMongoose.promise = null;
    throw e;
  }

  return cachedMongoose.conn;
}

export async function disconnectDB(): Promise<void> {
  if (cachedMongoose && cachedMongoose.conn) {
    await mongoose.disconnect();
    cachedMongoose.conn = null;
    cachedMongoose.promise = null;
  }
}

interface CachedMongoClient {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

let cachedClient = global.mongoClientConnection as CachedMongoClient | undefined;

if (!cachedClient) {
  cachedClient = global.mongoClientConnection = { client: null, promise: null };
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!cachedClient) {
    cachedClient = { client: null, promise: null };
  }
  if (cachedClient.client) {
    return cachedClient.client;
  }
  if (!cachedClient.promise) {
    cachedClient.promise = MongoClient.connect(MONGODB_URI as string).then((client) => {
      return client;
    });
  }
  try {
    cachedClient.client = await cachedClient.promise;
  } catch (e) {
    cachedClient.promise = null;
    throw e;
  }
  return cachedClient.client;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: CachedMongoose;
  // eslint-disable-next-line no-var
  var mongoClientConnection: CachedMongoClient;
}
