import { Request, Response } from 'express';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import DoctorProfile from '../models/DoctorProfile';
import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/auth';
import { sendEmail } from '../utils/email';
import { emitToAdmins } from '../sockets/socket';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, specialization } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPassword, role, phone });

    if (role === 'patient') {
      await PatientProfile.create({ userId: user._id });
    }  else if (role === 'doctor') {
      await DoctorProfile.create({ userId: user._id, specialization: specialization || 'General' });
      emitToAdmins('doctor:newRegistration', { doctorId: user._id, name: user.name, email: user.email });
    }

    const accessToken = signAccessToken(String(user._id), user.role);
    const refreshToken = signRefreshToken(String(user._id), user.role);
    user.refreshToken = refreshToken;
    await user.save();

    void sendEmail(user.email, 'Welcome to MediFlow', 'welcome', { name: user.name });

    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(String(user._id), user.role);
    const refreshToken = signRefreshToken(String(user._id), user.role);
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: incomingRefreshToken } = req.body;
    if (!incomingRefreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(incomingRefreshToken);
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken(String(user._id), user.role);
    const newRefreshToken = signRefreshToken(String(user._id), user.role);
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    return res.json({ message: 'Logged out' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?email=${email}`;
    void sendEmail(user.email, 'Reset your password', 'resetPassword', { name: user.name, link });
    return res.json({ message: 'Password reset email sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send reset email' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await hashPassword(password);
    await user.save();
    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reset password' });
  }
};
