const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);

const raw = require('fs').readFileSync('.env', 'utf8');
const m = raw.match(/^MONGODB_URI=(.+)$/m);
const uri = m ? m[1].trim() : '';
const DB = 'hrms';

(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000, connectTimeoutMS: 15000, tls: true });
  await client.connect();
  const db = client.db(DB);
  
  console.log('=== HRMS Test Data Cleanup ===\n');
  
  // Step 1: Identify test users
  const testUsers = await db.collection('users').find({ email: /@test\.example\.com$/ }).toArray();
  console.log('Step 1: Test users found:', testUsers.length);
  const testIds = new Set(testUsers.map(u => u._id.toString()));
  
  // Step 2: Delete test users
  console.log('\nStep 2: Deleting', testUsers.length, 'test users...');
  const deleteResult = await db.collection('users').deleteMany({ email: /@test\.example\.com$/ });
  console.log('  Deleted:', deleteResult.deletedCount, 'users');
  
  // Step 3: Delete orphaned projects (owned by non-real users)
  const projects = await db.collection('projects').find({}).toArray();
  const realUsers = await db.collection('users').find({}).project({ _id: 1 }).toArray();
  const realIds = new Set(realUsers.map(u => u._id.toString()));
  const orphanProjects = projects.filter(p => !realIds.has(p.ownerId));
  console.log('\nStep 3: Orphaned projects (owned by non-real users):', orphanProjects.length);
  if (orphanProjects.length > 0) {
    const projIds = orphanProjects.map(p => p._id);
    const projResult = await db.collection('projects').deleteMany({ _id: { $in: projIds } });
    console.log('  Deleted:', projResult.deletedCount, 'projects');
  }
  
  // Step 4: Delete orphaned tasks (assigneeId not a real user)
  const tasks = await db.collection('tasks').find({}).toArray();
  const orphanTasks = tasks.filter(t => {
    // Check both assigneeId and any user reference fields
    const id = t.assigneeId || t.userId || t.employeeId;
    return id && !realIds.has(id) && !id.startsWith('admin');
  });
  console.log('\nStep 4: Orphaned tasks:', orphanTasks.length);
  if (orphanTasks.length > 0) {
    const taskIds = orphanTasks.map(t => t._id);
    const taskResult = await db.collection('tasks').deleteMany({ _id: { $in: taskIds } });
    console.log('  Deleted:', taskResult.deletedCount, 'tasks');
  }
  
  // Step 5: Delete notifications for test users (but keep real user notifications)
  // The notification userId "6a885011e20c412945c9769f" is a test user - delete those
  console.log('\nStep 5: Deleting notifications for test users...');
  const testNotifications = await db.collection('notifications').find({ userId: { $in: [...testIds] } }).toArray();
  console.log('  Notifications belonging to test users:', testNotifications.length);
  if (testNotifications.length > 0) {
    const notifResult = await db.collection('notifications').deleteMany({ userId: { $in: [...testIds] } });
    console.log('  Deleted:', notifResult.deletedCount, 'notifications');
  }
  
  // Step 6: Delete any remaining attendance records that reference test users
  console.log('\nStep 6: Checking attendance for test user references...');
  const attResult = await db.collection('attendance').deleteMany({ 
    $or: [
      { userId: { $in: [...testIds] } },
      { userEmail: /@test\.example\.com$/ }
    ]
  });
  console.log('  Deleted:', attResult.deletedCount, 'attendance records');
  
  // Step 7: Delete any remaining docs in other collections referencing test users
  const otherCollections = ['onboarding', 'timesheets', 'payroll', 'leaves'];
  for (const collName of otherCollections) {
    try {
      const coll = db.collection(collName);
      const count = await coll.countDocuments();
      if (count > 0) {
        const delResult = await coll.deleteMany({
          $or: [
            { userId: { $in: [...testIds] } },
            { email: /@test\.example\.com$/ },
            { employeeEmail: /@test\.example\.com$/ },
            { userEmail: /@test\.example\.com$/ }
          ]
        });
        if (delResult.deletedCount > 0) {
          console.log('\n  ' + collName + ': deleted', delResult.deletedCount, 'docs');
        }
      }
    } catch(e) { console.log('  ' + collName + ': not found or error'); }
  }
  
  // Summary
  console.log('\n=== CLEANUP SUMMARY ===');
  const remainingUsers = await db.collection('users').countDocuments();
  const remainingNotifs = await db.collection('notifications').countDocuments();
  const remainingAtt = await db.collection('attendance').countDocuments();
  const remainingProj = await db.collection('projects').countDocuments();
  const remainingTasks = await db.collection('tasks').countDocuments();
  const remainingOL = await db.collection('offerLetters').countDocuments();
  
  console.log('Users: ' + remainingUsers + ' (was 52, expected 13)');
  console.log('Notifications: ' + remainingNotifs + ' (was 378)');
  console.log('Attendance: ' + remainingAtt + ' (was 17, expected 17 - all real)');
  console.log('Projects: ' + remainingProj + ' (was 3, expected 0)');
  console.log('Tasks: ' + remainingTasks + ' (was 1, expected 0)');
  console.log('Offer Letters: ' + remainingOL + ' (was 2, expected 2 - both real)');
  
  // Verify the 13 real users
  console.log('\n=== REMAINING REAL USERS ===');
  const remaining = await db.collection('users').find({}).project({ email: 1, role: 1, status: 1 }).sort({ email: 1 }).toArray();
  remaining.forEach(u => console.log('  ' + u.email + ' (' + u.role + ', ' + u.status + ')'));
  
  await client.close();
  console.log('\nDone.');
})().catch(e => console.error('ERROR:', e.message));
