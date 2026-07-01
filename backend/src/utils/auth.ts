import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePassword = async (password: string, hash: string) => bcrypt.compare(password, hash);

export const signAccessToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET || 'access-secret', { expiresIn: ACCESS_TOKEN_TTL });

export const signRefreshToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: REFRESH_TOKEN_TTL });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret') as { userId: string; role: string };

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as { userId: string; role: string };

export const getUserFromToken = async (token: string) => {
  const payload = verifyAccessToken(token);
  return User.findById(payload.userId);
};
