import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export const configureSocket = (socketServer: Server) => {
  io = socketServer;
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || '';
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret') as { userId: string; role: string };
      (socket as any).user = payload;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (user) {
      socket.join(`user:${user.userId}`);
      socket.join(`role:${user.role}`);
    }

    socket.on('disconnect', () => {
      // no-op
    });
  });
};

export const emitAppointmentStatusChanged = (userId: string, payload: unknown) => {
  io.to(`user:${userId}`).emit('appointment:statusChanged', payload);
};

export const emitPrescriptionCreated = (userId: string, payload: unknown) => {
  io.to(`user:${userId}`).emit('prescription:created', payload);
};

export const emitDoctorVerificationUpdated = (userId: string, payload: unknown) => {
  io.to(`user:${userId}`).emit('doctor:verificationUpdated', payload);
};

export const emitNotification = (userId: string, event: string, payload: unknown) => {
  io.to(`user:${userId}`).emit(event, payload);
};

export const emitToAdmins = (event: string, payload: unknown) => {
  io.to('role:admin').emit(event, payload);
};
