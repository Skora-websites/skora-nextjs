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
  { name: 'Vishal Srivastava', email: 'skorainfotech@gmail.com', password: 'Password@123', role: 'SUPER_ADMIN', department: 'Executive', onboardingStatus: 'VERIFIED', baseSalary: 0, employeeCode: 'CEO-001' },
  { name: 'Vishal Srivastava', email: 'hr@skorainfotech.com', password: 'Password@123', role: 'HR_ADMIN', department: 'Human Resources', onboardingStatus: 'VERIFIED', baseSalary: 95000, employeeCode: 'HR-001' },
  { name: 'Rajat Kashyap', email: 'rajat.stf007@gmail.com', password: 'Password@123', role: 'MANAGER', department: 'Development', onboardingStatus: 'VERIFIED', baseSalary: 80000, employeeCode: 'MGR-DEV-001' },
  { name: 'Vipul Singh', email: 'vipul.skorasoft@gmail.com', password: 'Password@123', role: 'MANAGER', department: 'Sales', onboardingStatus: 'VERIFIED', baseSalary: 75000, employeeCode: 'MGR-SLS-001' },
  { name: 'Shivangi Gupta', email: 'sg.shivangi@outlook.com', password: 'Password@123', role: 'MANAGER', department: 'Marketing', onboardingStatus: 'VERIFIED', baseSalary: 75000, employeeCode: 'MGR-MKT-001' },
  { name: 'Goldy Chaudhary', email: 'chaudharygoldy08@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Marketing', onboardingStatus: 'PENDING_REVIEW', baseSalary: 50000, employeeCode: 'EMP-MKT-001' },
  { name: 'Maaz Hasan', email: 'maazhasan024@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Marketing', onboardingStatus: 'PENDING_REVIEW', baseSalary: 50000, employeeCode: 'EMP-MKT-002' },
  { name: 'Sapna', email: 'sapnadelhi2004@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Marketing', onboardingStatus: 'PENDING_REVIEW', baseSalary: 50000, employeeCode: 'EMP-MKT-003' },
  { name: 'Sachin', email: 'sk01506967961@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Marketing', onboardingStatus: 'PENDING_REVIEW', baseSalary: 50000, employeeCode: 'EMP-MKT-004' },
  { name: 'Simar Kaur', email: 'simarkaurwork15@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Marketing', onboardingStatus: 'PENDING_REVIEW', baseSalary: 50000, employeeCode: 'EMP-MKT-005' },
  { name: 'Ashish Mishra', email: 'ashish17427@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Development', onboardingStatus: 'PENDING_REVIEW', baseSalary: 60000, employeeCode: 'EMP-DEV-001' },
  { name: 'Shubha Pallavi', email: 'spallavivatsa@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Development', onboardingStatus: 'PENDING_REVIEW', baseSalary: 60000, employeeCode: 'EMP-DEV-002' },
  { name: 'Abhishek Singh', email: 'abhishek.skorasoft@gmail.com', password: 'Password@123', role: 'EMPLOYEE', department: 'Sales', onboardingStatus: 'PENDING_REVIEW', baseSalary: 55000, employeeCode: 'EMP-SLS-001' },
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
    console.log('\nAll users: Password@123 (must change on first login except CEO)');
    
    await mongoose.disconnect();
  } catch (err) {
    console.log('Error:', err.message);
    console.log('\nMongoDB Atlas connection failed.');
    console.log('Make sure your IP is whitelisted in MongoDB Atlas dashboard.');
  }
}

seed();
