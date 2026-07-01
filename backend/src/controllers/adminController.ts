import { Request, Response } from 'express';
import DoctorProfile from '../models/DoctorProfile';
import User from '../models/User';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import { sendEmail } from '../utils/email';
import { emitDoctorVerificationUpdated, emitNotification } from '../sockets/socket';

export const pendingDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await DoctorProfile.find({ verificationStatus: 'pending' }).populate('userId', 'name email').lean();
    return res.json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load pending doctors', error });
  }
};

export const verifyDoctor = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const profile = await DoctorProfile.findById(req.params.id).populate('userId');
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    profile.verificationStatus = status;
    await profile.save();

    const user = await User.findById(profile.userId);
    if (user) {
      const message = status === 'approved' ? 'Your doctor verification was approved.' : 'Your doctor verification was rejected.';
      const notification = await Notification.create({ userId: user._id, type: 'doctor:verificationUpdated', message, read: false });
      emitNotification(String(user._id), 'doctor:verificationUpdated', { notification });
      emitDoctorVerificationUpdated(String(user._id), { status, message });
      void sendEmail(user.email, status === 'approved' ? 'Verification Approved' : 'Verification Rejected', status === 'approved' ? 'verificationApproved' : 'verificationRejected', { name: user.name });
    }

    return res.json({ profile });
  } catch (error) {
    return res.status(500).json({ message: 'Verification failed', error });
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const [patients, doctors, appointments] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments()
    ]);

    return res.json({ stats: { patients, doctors, appointments } });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load statistics', error });
  }
};
