// db.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Require MONGODB_URI to be set - no local fallback
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('❌ MONGODB_URI environment variable is required');
  console.error('Please set MONGODB_URI in your .env file with your MongoDB Atlas connection string');
  process.exit(1);
}

// Validate that it's an Atlas connection string
if (!uri.includes('mongodb+srv://')) {
  console.error('❌ Invalid MongoDB URI. Must be a MongoDB Atlas connection string (mongodb+srv://)');
  console.error('Current URI format:', uri.split('@')[0] + '@***');
  process.exit(1);
}

console.log('Attempting to connect to: MongoDB Atlas');

// --- Error helpers ---

export function logMongoError(err) {
  console.error('MongoDB Error:');
  console.error('  Name   :', err.name);
  console.error('  Message:', err.message);
  if (err.code !== undefined) console.error('  Code   :', err.code);

  const cause = err.cause || err.reason;
  if (cause && cause.topologyDescription) {
    console.error('  Topology type:', cause.topologyDescription.type);
    console.error('  Set name      :', cause.topologyDescription.setName);
  }
}

export function isReplicaSetNoPrimaryError(err) {
  if (!err) return false;

  const serverSelectionNames = [
    'MongoServerSelectionError',
    'MongooseServerSelectionError',
  ];

  if (serverSelectionNames.includes(err.name)) {
    const cause = err.cause || err.reason;

    if (
      cause &&
      cause.topologyDescription &&
      cause.topologyDescription.type === 'ReplicaSetNoPrimary'
    ) {
      return true;
    }

    if (
      err.topologyDescription &&
      err.topologyDescription.type === 'ReplicaSetNoPrimary'
    ) {
      return true;
    }
  }

  // Fallback: message contains the text (not ideal, but practical)
  if (typeof err.message === 'string' && err.message.includes('ReplicaSetNoPrimary')) {
    return true;
  }

  return false;
}

// Map Mongo/Mongoose errors to HTTP responses (for routes to use)
export function mapMongoErrorToHttp(error) {
  // Replica set has no primary – typically Atlas failover / election window
  if (isReplicaSetNoPrimaryError(error)) {
    return {
      status: 503,
      message: 'Database cluster is temporarily unavailable. Please try again shortly.',
    };
  }

  // Mongoose validation errors (bad data from client)
  if (error.name === 'ValidationError') {
    return {
      status: 400,
      message: error.message,
    };
  }

  // Duplicate key (unique index violation)
  if (error.code === 11000) {
    return {
      status: 409,
      message: 'Duplicate value. A record with these details already exists.',
    };
  }

  // Default fallback
  return {
    status: 500,
    message: 'Internal server error.',
  };
}

// --- Connect function ---

export async function connectDB() {
  try {
    await mongoose.connect(uri, {
      // How long MongoDB can take to pick a server (incl. primary) before erroring
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error at startup:');
    logMongoError(err);

    // DB is critical; exit so process/container can be restarted
    process.exit(1);
  }

  // Listen for runtime errors (e.g., Atlas failover)
  mongoose.connection.on('error', (err) => {
    console.error('⚠️ MongoDB runtime connection error:');
    logMongoError(err);  

    if (isReplicaSetNoPrimaryError(err)) {
      console.error(
        'Replica set has no primary. Some requests may fail until a new primary is elected.'
      );
    }
  });
}

// Optional: expose mongoose for readyState checks in other files
export { mongoose };