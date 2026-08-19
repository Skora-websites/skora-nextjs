import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const isPlaceholder = !uri || uri.includes("username:password") || uri.includes("<username>");

let clientPromise: Promise<MongoClient | null> | undefined;

if (uri && !isPlaceholder) {
  const options = {
    serverSelectionTimeoutMS: 2000, // 2s quick timeout if MongoDB is offline
  };

  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient | null>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
        // Silently handle offline MongoDB service without crashing
        return null;
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect().catch(() => null);
  }
}

export default clientPromise;
