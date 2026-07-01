import { Request, Response } from 'express';
import Report from '../models/Report';
import cloudinary from '../utils/cloudinary';

export const uploadReport = async (req: Request, res: Response) => {
  try {
    const { patientId, type } = req.body;
    const file = req.file as any;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadResult = await cloudinary.uploader.upload(file.path || file.buffer, { folder: 'mediflow/reports', resource_type: 'auto' });
    const report = await Report.create({ patientId, uploadedBy: req.user._id, fileUrl: uploadResult.secure_url, publicId: uploadResult.public_id, type });
    return res.status(201).json({ report });
  } catch (error) {
    return res.status(500).json({ message: 'Upload failed', error });
  }
};

export const getPatientReports = async (req: Request, res: Response) => {
  try {
    const reports = await Report.find({ patientId: req.params.patientId }).sort({ createdAt: -1 }).lean();
    return res.json({ reports });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch reports', error });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only the patient who owns the report, or the doctor/staff who uploaded it, can delete it
    if (String(report.patientId) !== String(req.user._id) && String(report.uploadedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await cloudinary.uploader.destroy(report.publicId, { resource_type: 'image' });
    await report.deleteOne();

    return res.json({ message: 'Report deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete report', error });
  }
};