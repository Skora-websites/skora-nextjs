const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);

const raw = require('fs').readFileSync('.env', 'utf8');
const m = raw.match(/^MONGODB_URI=(.+)$/m);
const uri = m ? m[1].trim() : '';
const DB = 'hrms';

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000, tls: true });
  await client.connect();
  const db = client.db(DB);
  
  // Check the ownerId in projects - is it a test user or real?
  const projects = await db.collection('projects').find({}).toArray();
  const realUsers = await db.collection('users').find({ email: { $not: /@test\.example\.com$/ } }).project({ _id: 1 }).toArray();
  const realIds = new Set(realUsers.map(u => u._id.toString()));
  console.log('Project ownerIds:');
  projects.forEach(p => {
    const isReal = realIds.has(p.ownerId);
    console.log('  ownerId:', p.ownerId, '->', isReal ? 'REAL USER' : 'NOT A REAL USER (test or unknown)');
  });
  
  // Notifications - check types and userId distribution
  console.log('\n=== NOTIFICATION TYPES ===');
  const types = await db.collection('notifications').aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  types.forEach(t => console.log('  ' + t._id + ': ' + t.count));
  
  console.log('\n=== NOTIFICATION USERID VALUES ===');
  const userIdStats = await db.collection('notifications').aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]).toArray();
  userIdStats.forEach(s => console.log('  userId="' + s._id + '": ' + s.count));
  
  // Check if any notifications reference test userIds
  const testUsers = await db.collection('users').find({ email: /@test\.example\.com$/ }).project({ _id: 1 }).toArray();
  const testIds = testUsers.map(u => u._id.toString());
  console.log('\nTest user IDs:', testIds.length);
  
  for (const id of testIds.slice(0, 3)) {
    const c = await db.collection('notifications').countDocuments({ userId: id });
    console.log('  Notifications for test user ' + id.slice(0,8) + '...: ' + c);
  }
  
  await client.close();
  console.log('\nDone.');
})().catch(e => console.error('ERROR:', e.message));
