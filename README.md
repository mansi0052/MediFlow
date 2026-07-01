# MediFlow

MediFlow is a role-based healthcare management platform with doctor, patient, and admin workflows.

## Stack
- Backend: Node.js, Express, TypeScript, MongoDB, JWT, Socket.io
- Frontend: React, TypeScript, Vite, Tailwind CSS

## Quick start

### Backend
1. `cd backend`
2. `cp .env.example .env`
3. Update the environment values for MongoDB, Cloudinary, and SMTP.
4. `npm install`
5. `npm run build`
6. `npm run seed`
7. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Demo accounts
- Admin: `admin@mediflow.local` / `admin123`
- Doctor: `doctor@mediflow.local` / `doctor123`
- Patient: `patient@mediflow.local` / `patient123`

## API overview
The backend exposes auth, patient, doctor, admin, appointment, prescription, and report endpoints under `/api`.
