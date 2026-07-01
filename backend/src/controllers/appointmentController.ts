import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import Notification from '../models/Notification';
import { sendEmail } from '../utils/email';
import { emitAppointmentStatusChanged, emitNotification } from '../sockets/socket';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, date, timeSlot, notes } = req.body;
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(409).json({ message: 'Doctor is already booked at this time' });
    }

    const appointment = await Appointment.create({ patientId: req.user._id, doctorId, date, timeSlot, notes });
    const notification = await Notification.create({ userId: doctorId, type: 'appointment:statusChanged', message: 'You have a new appointment request.', read: false });
    emitNotification(String(doctorId), 'appointment:statusChanged', { appointment, notification });
    emitAppointmentStatusChanged(String(doctorId), { appointment, status: appointment.status });

    return res.status(201).json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create appointment', error });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId patientId', 'name email').lean();
    return res.json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load appointment', error });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('patientId doctorId', 'name email');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    appointment.status = status;
    await appointment.save();
    const patient = appointment.patientId as any;
    const doctor = appointment.doctorId as any;
    const notification = await Notification.create({ userId: patient._id, type: 'appointment:statusChanged', message: `Appointment status changed to ${status}.`, read: false });
    emitNotification(String(patient._id), 'appointment:statusChanged', { appointment, notification });
    emitAppointmentStatusChanged(String(patient._id), { appointment, status });
    if (status === 'confirmed') {
      void sendEmail(patient.email, 'Appointment Confirmed', 'appointmentConfirmed', { name: patient.name, doctorName: doctor.name });
    } else if (status === 'cancelled') {
      void sendEmail(patient.email, 'Appointment Cancelled', 'appointmentCancelled', { name: patient.name });
    }
    return res.json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Appointment deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete appointment', error });
  }
};
