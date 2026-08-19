import { MongoClient } from "mongodb";
import dns from "dns";

// Ensure Node.js on Windows resolves MongoDB Atlas SRV records reliably
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const uri = process.env.MONGODB_URI;
const isPlaceholder = !uri || uri.includes("<username>") || uri.includes("<password>");

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri || isPlaceholder) return null;

  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient | null>;
  };

  if (globalWithMongo._mongoClientPromise) {
    const client = await globalWithMongo._mongoClientPromise;
    if (client) return client;
    // Reset if previously failed
    globalWithMongo._mongoClientPromise = undefined;
  }

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    const connectPromise = client.connect().catch((err) => {
      console.warn("[MongoDB] Connection error:", err.message);
      globalWithMongo._mongoClientPromise = undefined;
      return null;
    });

    globalWithMongo._mongoClientPromise = connectPromise;
    return await connectPromise;
  } catch {
    globalWithMongo._mongoClientPromise = undefined;
    return null;
  }
}

let clientPromise: Promise<MongoClient | null> | undefined;
if (uri && !isPlaceholder) {
  clientPromise = getMongoClient();
}

export default clientPromise;
