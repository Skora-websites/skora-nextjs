const { MongoClient, MongoClientOptions } = require('mongodb');
const fs = require('fs');

// Set DNS servers so the MongoDB driver can resolve SRV records
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);

const raw = fs.readFileSync('.env', 'utf8');
const m = raw.match(/^MONGODB_URI=(.+)$/m);
const uri = m ? m[1].trim() : '';
const DB = 'hrms';

const options = {
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 15000,
  tls: true,
  retryWrites: true,
  w: 'majority',
};

console.log('Connecting to MongoDB Atlas...');
console.log('URI (creds redacted):', uri.replace(/:([^:@]+)@/, ':[REDACTED]@'));

(async () => {
  try {
    const client = new MongoClient(uri, options);
    await client.connect();
    console.log('\nConnected to MongoDB!');
    const db = client.db(DB);
    
    const users = await db.collection('users').find({}).project({ name:1, email:1, role:1, status:1, secondName:1, mustChangePassword:1, employeeId:1 }).sort({ email:1 }).toArray();
    console.log('\n=== ALL USERS (' + users.length + ') ===');
    users.forEach(u => console.log(JSON.stringify(u)));
    
    const ol = await db.collection('offerLetters').find({}).toArray();
    console.log('\n=== OFFER LETTERS (' + ol.length + ') ===');
    ol.forEach(o => console.log(JSON.stringify({
      id: o._id, employeeEmail: o.employeeEmail, employeeName: o.employeeName,
      status: o.status, managerEmail: o.managerEmail, type: o.type,
      salary: o.salary, joiningDate: o.joiningDate,
      createdAt: o.createdAt, releasedAt: o.releasedAt
    })));
    
    console.log('\nauthSessions:', await db.collection('authSessions').countDocuments());
    console.log('attendance:', await db.collection('attendance').countDocuments());
    console.log('leaves:', await db.collection('leaves').countDocuments());
    console.log('onboarding:', await db.collection('onboarding').countDocuments());
    console.log('timesheets:', await db.collection('timesheets').countDocuments());
    console.log('projects:', await db.collection('projects').countDocuments());
    console.log('tasks:', await db.collection('tasks').countDocuments());
    console.log('payroll:', await db.collection('payroll').countDocuments());
    console.log('notifications:', await db.collection('notifications').countDocuments());
    
    await client.close();
    console.log('\nDone.');
  } catch(e) { 
    console.error('\nERROR:', e.message);
    if (e.name === 'MongoServerSelectionError') {
      console.error('Details:', JSON.stringify(e, (k, v) => k === 'message' || k === 'name' ? v : undefined, 2).slice(0, 2000));
    }
  }
})();
