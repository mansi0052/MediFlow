import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  patientId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileUrl: string;
  publicId: string;
  type: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReport>('Report', reportSchema);
