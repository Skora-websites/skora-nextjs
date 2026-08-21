const fs = require('fs');
const mongoose = require('mongoose');

// Load .env manually
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq > 0) env[trimmed.substring(0, eq)] = trimmed.substring(eq + 1);
}

const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) {
  console.log('ERROR: MONGODB_URI not found in .env');
  process.exit(1);
}

const users = [
  { name: 'Super Admin', email: 'superadmin@skorabiz.com', password: 'password123', role: 'SUPER_ADMIN', department: 'Executive Board', onboardingStatus: 'VERIFIED', baseSalary: 120000, employeeCode: 'SA-0001' },
  { name: 'Sarah Connor', email: 'hr@skorabiz.com', password: 'password123', role: 'HR_ADMIN', department: 'Human Resources', onboardingStatus: 'VERIFIED', baseSalary: 95000, employeeCode: 'HR-0001' },
  { name: 'Marcus Brody', email: 'manager@skorabiz.com', password: 'password123', role: 'MANAGER', department: 'Engineering', onboardingStatus: 'VERIFIED', baseSalary: 110000, employeeCode: 'MGR-0001' },
  { name: 'Alex Mercer', email: 'employee@skorabiz.com', password: 'password123', role: 'EMPLOYEE', department: 'Engineering', onboardingStatus: 'PENDING_REVIEW', baseSalary: 75000, employeeCode: 'EMP-0001' },
];

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  try {
    await mongoose.connect(MONGODB_URI, { 
      serverSelectionTimeoutMS: 15000,
      bufferCommands: true 
    });
    console.log('Connected!');
    
    const db = mongoose.connection.db;
    
    for (const u of users) {
      const exists = await db.collection('users').findOne({ email: u.email });
      if (exists) {
        console.log('  SKIP (exists):', u.email, '-', u.role);
      } else {
        await db.collection('users').insertOne({ ...u, createdAt: new Date() });
        console.log('  CREATED:', u.email, '-', u.role);
      }
    }
    
    const total = await db.collection('users').countDocuments();
    console.log('\nTotal users:', total);
    console.log('\nLogin credentials:');
    console.log('  superadmin@skorabiz.com / password123  (SUPER_ADMIN)');
    console.log('  hr@skorabiz.com / password123          (HR_ADMIN)');
    console.log('  manager@skorabiz.com / password123     (MANAGER)');
    console.log('  employee@skorabiz.com / password123    (EMPLOYEE)');
    
    await mongoose.disconnect();
  } catch (err) {
    console.log('Error:', err.message);
    console.log('\nMongoDB Atlas connection failed.');
    console.log('Make sure your IP is whitelisted in MongoDB Atlas dashboard.');
  }
}

seed();
