import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Batch from './models/Batch.js';
import Attendance from './models/Attendance.js';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Batch.deleteMany({});
    await Attendance.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
    const hashedStudentPassword = await bcrypt.hash('student123', 10);

    // ========== 1. CREATE ADMIN USER ==========
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@example.com',
      password: hashedAdminPassword,
      role: 'admin',
      batch_id: null
    });
    console.log('✅ Admin created:', admin.email);

    // ========== 2. CREATE BATCH OWNERS (Teachers) ==========
    const teacher1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      password: hashedTeacherPassword,
      role: 'batch_owner',
      batch_id: null
    });

    const teacher2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: hashedTeacherPassword,
      role: 'batch_owner',
      batch_id: null
    });

    console.log('✅ Batch owners created: 2');

    // ========== 3. CREATE BATCHES ==========
    const batch1 = await Batch.create({
      name: 'Batch A - Morning',
      owner_id: teacher1._id
    });

    const batch2 = await Batch.create({
      name: 'Batch B - Evening',
      owner_id: teacher2._id
    });

    console.log('✅ Batches created: 2');

    // ========== 4. CREATE STUDENTS ==========
    const students = await User.insertMany([
      // Batch A Students
      {
        name: 'Amit Singh',
        email: 'amit@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch1._id
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch1._id
      },
      {
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch1._id
      },
      {
        name: 'Pooja Gupta',
        email: 'pooja@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch1._id
      },
      {
        name: 'Vikram Rao',
        email: 'vikram@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch1._id
      },
      
      // Batch B Students
      {
        name: 'Anjali Reddy',
        email: 'anjali@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Karan Malhotra',
        email: 'karan@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Neha Joshi',
        email: 'neha@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Arjun Kapoor',
        email: 'arjun@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Divya Nair',
        email: 'divya@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Rohan Das',
        email: 'rohan@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Isha Mehta',
        email: 'isha@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Sanjay Desai',
        email: 'sanjay@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      },
      {
        name: 'Kavya Iyer',
        email: 'kavya@example.com',
        password: hashedStudentPassword,
        role: 'student',
        batch_id: batch2._id
      }
    ]);

    console.log('✅ Students created: 14');

    // ========== 5. CREATE SAMPLE ATTENDANCE ==========
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's attendance for Batch A
    const batch1Students = students.filter(s => s.batch_id.equals(batch1._id));
    const todayAttendanceBatch1 = batch1Students.map((student, index) => ({
      batchid: batch1._id,
      batch_name: batch1.name,
      date: today,
      studentname: student.name,
      status: index < 4 ? 'present' : (index === 4 ? 'late' : 'absent'),
      marked_by: teacher1._id
    }));

    // Yesterday's attendance for Batch B
    const batch2Students = students.filter(s => s.batch_id.equals(batch2._id));
    const yesterdayAttendanceBatch2 = batch2Students.slice(0, 7).map((student, index) => ({
      batchid: batch2._id,
      batch_name: batch2.name,
      date: yesterday,
      studentname: student.name,
      status: index < 5 ? 'present' : (index === 5 ? 'late' : 'absent'),
      marked_by: teacher2._id
    }));

    await Attendance.insertMany([
      ...todayAttendanceBatch1,
      ...yesterdayAttendanceBatch2
    ]);

    console.log('✅ Attendance records created: 12');

    // ========== SUMMARY ==========
    console.log('\n📊 DATABASE SEEDED SUCCESSFULLY!');
    console.log('================================');
    console.log('👤 Admin: admin@example.com / admin123');
    console.log('👨‍🏫 Teacher 1: rajesh@example.com / teacher123');
    console.log('👨‍🏫 Teacher 2: priya@example.com / teacher123');
    console.log('📚 Batches: 2');
    console.log('👥 Students: 14');
    console.log('📝 Attendance: 12 records');
    console.log('================================\n');

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
