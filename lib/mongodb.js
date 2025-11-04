import { MongoClient } from 'mongodb';
import logger from '@/app/utils/logger';

if (!process.env.MONGODB_URI) throw new Error('Please add your MongoDB URI to .env.local');

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

export async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
      logger.dev('New MongoDB connection established');
    }
    
    const db = (await clientPromise).db();
    logger.dev('Connected to MongoDB database');
    return db;
  } catch (error) {
    logger.error(error, 'MongoDB Connection');
    throw error;
  }
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
