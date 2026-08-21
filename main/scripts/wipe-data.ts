import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skora_hrms';

async function wipeDatabase() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  try {
    const conn = await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    const collections = await conn.connection.db?.collections();
    if (collections) {
      for (const col of collections) {
        await col.deleteMany({});
        console.log(`Cleared collection: ${col.collectionName}`);
      }
    }
    console.log('Database wiped completely to zero!');
  } catch (err: any) {
    console.log('Notice:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

wipeDatabase();
