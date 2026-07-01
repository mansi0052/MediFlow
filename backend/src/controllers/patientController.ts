import { Request, Response } from 'express';
import PatientProfile from '../models/PatientProfile';
import Appointment from '../models/Appointment';

export const getMe = async (req: Request, res: Response) => {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id }).lean();
    return res.json({ user: req.user, profile });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load profile', error });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await PatientProfile.create({ userId: req.user._id });
    }

    Object.assign(profile, updates);
    await profile.save();
    return res.json({ profile });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error });
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id }).populate('doctorId', 'name email').sort({ createdAt: -1 });
    return res.json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch appointments', error });
  }
};
