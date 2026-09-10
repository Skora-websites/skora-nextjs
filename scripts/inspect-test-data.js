const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);

const raw = require('fs').readFileSync('.env', 'utf8');
const m = raw.match(/^MONGODB_URI=(.+)$/m);
const uri = m ? m[1].trim() : '';
const DB = 'hrms';

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000, tls: true, socketTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(DB);
  
  // Get test emails (only those ending with @test.example.com)
  const testEmails = [];
  const cursor = db.collection('users').find({ email: /@test\.example\.com$/ }).project({ email: 1 });
  for await (const u of cursor) testEmails.push(u.email);
  console.log('Test emails (@test.example.com):', testEmails.length);
  console.log('Sample:', testEmails.slice(0, 5).join(', '));
  
  // Check key collections for test data
  const checkFields = [
    { coll: 'attendance', fields: ['employeeEmail', 'email', 'userEmail', 'user_id'] },
    { coll: 'leaves', fields: ['employeeEmail', 'email', 'userEmail'] },
    { coll: 'onboarding', fields: ['employeeEmail', 'email', 'userEmail'] },
    { coll: 'timesheets', fields: ['employeeEmail', 'userId', 'employeeId'] },
    { coll: 'notifications', fields: ['userId', 'email', 'user_id'] },
    { coll: 'authSessions', fields: ['userId', 'email', 'user_id'] },
    { coll: 'projects', fields: ['createdBy', 'managerEmail'] },
    { coll: 'tasks', fields: ['assigneeEmail', 'assignedTo', 'employeeEmail'] },
    { coll: 'payroll', fields: ['employeeEmail', 'employeeId'] },
    { coll: 'offerLetters', fields: ['employeeEmail'] },
  ];
  
  for (const { coll, fields } of checkFields) {
    try {
      const count = await db.collection(coll).countDocuments();
      console.log('\n=== ' + coll + ' (' + count + ' total) ===');
      
      // Count test emails in each field
      for (const field of fields) {
        try {
          const c = await db.collection(coll).countDocuments({ [field]: { $in: testEmails } });
          if (c > 0) console.log('  ' + field + ': ' + c + ' docs with test emails');
        } catch(e) { /* field might not exist */ }
      }
      
      // Show a few sample docs
      if (count > 0 && count <= 30) {
        const docs = await db.collection(coll).find({}).limit(3).toArray();
        docs.forEach(d => console.log('  Sample:', JSON.stringify(d).slice(0, 250)));
      }
    } catch(e) { console.log('Collection ' + coll + ' error:', e.message); }
  }
  
  await client.close();
  console.log('\nDone.');
})().catch(e => console.error('ERROR:', e.message));
