import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  specialization: string;
  qualifications: string[];
  documents: Array<{ url: string; publicId: string }>;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  availability: Array<{ day: string; startTime: string; endTime: string }>;
  createdAt: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  qualifications: [{ type: String }],
  documents: [{ url: String, publicId: String }],
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  availability: [{ day: String, startTime: String, endTime: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDoctorProfile>('DoctorProfile', doctorProfileSchema);
