import { Request, Response } from 'express';
import Prescription from '../models/Prescription';
import Notification from '../models/Notification';
import { emitNotification, emitPrescriptionCreated } from '../sockets/socket';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const { appointmentId, patientId, medicines, notes } = req.body;
    const prescription = await Prescription.create({ appointmentId, doctorId: req.user._id, patientId, medicines, notes });
    const notification = await Notification.create({ userId: patientId, type: 'prescription:created', message: 'A new prescription has been issued.', read: false });
    emitNotification(String(patientId), 'prescription:created', { prescription, notification });
    emitPrescriptionCreated(String(patientId), { prescription });
    return res.status(201).json({ prescription });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create prescription', error });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const prescription = await Prescription.findById(req.params.id).lean();
    return res.json({ prescription });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load prescription', error });
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId }).sort({ createdAt: -1 }).lean();
    return res.json({ prescriptions });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch prescriptions', error });
  }
};
