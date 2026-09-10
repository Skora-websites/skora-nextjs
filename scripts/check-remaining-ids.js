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
  
  // All real users
  const realUsers = await db.collection('users').find({}).project({ _id: 1, email: 1, name: 1 }).toArray();
  const realIdMap = {};
  realUsers.forEach(u => { realIdMap[u._id.toString()] = u; });
  
  console.log('Real users by ID:');
  for (const [id, u] of Object.entries(realIdMap)) {
    console.log('  ' + id + ' -> ' + (u.name || u.email));
  }
  
  // Check notification userIds against real users
  const notifUserIds = [
    '6a98618dd94d719849761237', // 65 onboarding
    'admin',                      // 27 attendance
    '6a92cdcfef5504a54d32b045',  // 2
    '6a98618dd94d719849761240',  // 1
    '6a92cdceef5504a54d32b03c',  // 1
    '6a98618dd94d719849761236',  // 1
  ];
  
  console.log('\nNotification userId -> real user mapping:');
  for (const id of notifUserIds) {
    if (id === 'admin') {
      console.log('  ' + id + ' -> SYSTEM (not a user document)');
      continue;
    }
    const user = realIdMap[id];
    if (user) {
      console.log('  ' + id + ' -> REAL: ' + (user.name || user.email) + ' (' + user.role + ')');
    } else {
      console.log('  ' + id + ' -> NOT A REAL USER (orphaned test reference)');
    }
  }
  
  // Check the 65 onboarding notifications - what are they about?
  const onboardingNotifs = await db.collection('notifications').find({ 
    userId: '6a98618dd94d719849761237', 
    type: 'onboarding' 
  }).limit(5).toArray();
  console.log('\nSample onboarding notifications for HR admin:');
  onboardingNotifs.forEach(n => console.log('  ', JSON.stringify(n).slice(0, 300)));
  
  // Check notification count by type for HR admin
  const hrAdminNotifCount = await db.collection('notifications').countDocuments({ userId: '6a98618dd94d719849761237' });
  console.log('\nHR admin total notifications:', hrAdminNotifCount);
  
  const hrAdminTypes = await db.collection('notifications').aggregate([
    { $match: { userId: '6a98618dd94d719849761237' } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]).toArray();
  console.log('By type:');
  hrAdminTypes.forEach(t => console.log('  ' + t._id + ': ' + t.count));
  
  await client.close();
  console.log('\nDone.');
})().catch(e => console.error('ERROR:', e.message));
