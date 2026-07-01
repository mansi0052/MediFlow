import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
import PatientProfile from './models/PatientProfile';
import DoctorProfile from './models/DoctorProfile';
import { hashPassword } from './utils/auth';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediflow');
  await User.deleteMany({});
  await PatientProfile.deleteMany({});
  await DoctorProfile.deleteMany({});

  const admin = await User.create({ name: 'Admin Supervisor', email: 'admin@mediflow.local', password: await hashPassword('admin123'), role: 'admin' });
  const doctor = await User.create({ name: 'Dr. Jane Smith', email: 'doctor@mediflow.local', password: await hashPassword('doctor123'), role: 'doctor' });
  const patient = await User.create({ name: 'John Doe', email: 'patient@mediflow.local', password: await hashPassword('patient123'), role: 'patient' });

  await DoctorProfile.create({ userId: doctor._id, specialization: 'Cardiology', verificationStatus: 'approved' });
  await PatientProfile.create({ userId: patient._id, medicalHistory: ['Asthma'], allergies: ['Penicillin'] });

  console.log('Seeded demo users');
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
