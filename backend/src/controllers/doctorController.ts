import { Request, Response } from 'express';
import DoctorProfile from '../models/DoctorProfile';
import Appointment from '../models/Appointment';
import User from '../models/User';

export const listDoctors = async (req: Request, res: Response) => {
  try {
    const { specialization } = req.query;
    const filter: Record<string, unknown> = { verificationStatus: 'approved' };
    if (specialization) filter.specialization = specialization;

    const profiles = await DoctorProfile.find(filter).populate('userId', 'name email phone').lean();
    return res.json({ doctors: profiles });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load doctors', error });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findById(req.params.id).populate('userId', 'name email phone').lean();
    return res.json({ doctor: profile });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load doctor', error });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }
    profile.availability = req.body.availability || [];
    await profile.save();
    return res.json({ availability: profile.availability });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update availability', error });
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user._id }).populate('patientId', 'name email').sort({ createdAt: -1 });
    return res.json({ appointments });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch appointments', error });
  }
};
