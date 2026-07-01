import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicine {
  name: string;
  dosage: string;
  duration: string;
}

export interface IPrescription extends Document {
  appointmentId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  medicines: IMedicine[];
  notes?: string;
  createdAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  medicines: [{ name: String, dosage: String, duration: String }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPrescription>('Prescription', prescriptionSchema);
