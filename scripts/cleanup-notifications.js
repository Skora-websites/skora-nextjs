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
  
  console.log('=== Cleaning remaining test notifications ===\n');
  
  // The test user ID that owns 281 notifications
  const testOwnerId = '6a885011e20c412945c9769f';
  
  // Delete notifications for the test owner
  const before = await db.collection('notifications').countDocuments({ userId: testOwnerId });
  console.log('Notifications for test owner ' + testOwnerId.slice(0, 8) + '...: ' + before);
  const del1 = await db.collection('notifications').deleteMany({ userId: testOwnerId });
  console.log('Deleted:', del1.deletedCount);
  
  // Now check remaining notifications
  const remaining = await db.collection('notifications').countDocuments();
  console.log('\nRemaining notifications:', remaining);
  
  // Show remaining by type
  const types = await db.collection('notifications').aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\nBy type:');
  types.forEach(t => console.log('  ' + t._id + ': ' + t.count));
  
  // Show remaining by userId
  const byUser = await db.collection('notifications').aggregate([
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).toArray();
  console.log('\nBy userId:');
  byUser.forEach(u => console.log('  ' + u._id + ': ' + u.count));
  
  // Check: the 65 notifications for HR admin (6a98618dd94d719849761237) are real attendance alerts - keep
  // The 27 for "admin" are real attendance alerts - keep
  // The 5 offer_letter notifications - check them
  const olNotifs = await db.collection('notifications').find({ type: 'offer_letter' }).toArray();
  console.log('\nOffer letter notifications (' + olNotifs.length + '):');
  olNotifs.forEach(n => console.log('  ', JSON.stringify(n).slice(0, 250)));
  
  // The 27 "admin" attendance notifications - are these for real users?
  const adminNotifs = await db.collection('notifications').find({ userId: 'admin' }).limit(3).toArray();
  console.log('\nSample "admin" notifications:');
  adminNotifs.forEach(n => console.log('  ', JSON.stringify(n).slice(0, 200)));
  
  await client.close();
  console.log('\nDone.');
})().catch(e => console.error('ERROR:', e.message));
