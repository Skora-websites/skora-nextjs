import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dns from "dns";

// Use Google & Cloudflare DNS servers in Node.js to resolve Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const uri = "mongodb+srv://ashish17427_db_user:pq9076MTwxbLndyl@cluster0.qgcsfty.mongodb.net/skora_db?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db("skora_db");

    const dbFilePath = path.join(process.cwd(), "data", "skora_db.json");
    if (!fs.existsSync(dbFilePath)) {
      console.log("No data/skora_db.json file found.");
      return;
    }

    const fileData = JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));

    // 1. Seed Dedicated 'admin' Collection
    const adminCollection = db.collection("admin");
    await adminCollection.updateOne(
      { key: "admin_user" },
      {
        $set: {
          key: "admin_user",
          username: "admin",
          passwordHash: "Skora@admin2026",
          role: "SuperAdmin",
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );
    console.log("Successfully seeded dedicated 'admin' collection in MongoDB Atlas!");

    // 2. Seed 'content' Collection (clean public site data)
    if (fileData.content) {
      const { adminUsername, adminPasswordHash, ...publicContent } = fileData.content;
      const contentCollection = db.collection("content");
      await contentCollection.updateOne(
        { key: "global_site_content" },
        { 
          $set: { 
            key: "global_site_content", 
            ...publicContent,
          },
          $unset: {
            adminUsername: "",
            adminPasswordHash: ""
          }
        },
        { upsert: true }
      );
      console.log("Successfully seeded 'content' collection in MongoDB Atlas!");
    }

    // 3. Seed 'leads' Collection
    if (fileData.leads && fileData.leads.length > 0) {
      const leadsCollection = db.collection("leads");
      for (const lead of fileData.leads) {
        await leadsCollection.updateOne(
          { id: lead.id },
          { $set: lead },
          { upsert: true }
        );
      }
      console.log(`Successfully seeded ${fileData.leads.length} items into 'leads' collection in MongoDB Atlas!`);
    }

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.close();
  }
}

run();
