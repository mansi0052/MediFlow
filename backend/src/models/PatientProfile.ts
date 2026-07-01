import mongoose, { Document, Schema } from 'mongoose';

export interface IPatientProfile extends Document {
  userId: mongoose.Types.ObjectId;
  medicalHistory: string[];
  allergies: string[];
  dob?: Date;
  gender?: string;
  createdAt: Date;
}

const patientProfileSchema = new Schema<IPatientProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  medicalHistory: [{ type: String }],
  allergies: [{ type: String }],
  dob: { type: Date },
  gender: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPatientProfile>('PatientProfile', patientProfileSchema);
