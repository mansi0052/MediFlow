import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendEmail = async (to: string, subject: string, templateName: string, data: Record<string, unknown>) => {
 const templates: Record<string, string> = {
    welcome: `<h1>Welcome to MediFlow</h1><p>Hello ${data.name}, your account has been created successfully.</p>`,
    appointmentConfirmed: `<h1>Appointment Confirmed</h1><p>Hello ${data.name}, your appointment with ${data.doctorName} is confirmed.</p>`,
    appointmentCancelled: `<h1>Appointment Cancelled</h1><p>Hello ${data.name}, your appointment has been cancelled.</p>`,
    verificationApproved: `<h1>Verification Approved</h1><p>Hello ${data.name}, your doctor verification has been approved.</p>`,
    verificationRejected: `<h1>Verification Rejected</h1><p>Hello ${data.name}, your doctor verification has been rejected.</p>`,
    resetPassword: `<h1>Reset Password</h1><p>Hello ${data.name}, use this link to reset your password: ${data.link}</p>`
  };

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@mediflow.local',
      to,
      subject,
      html: templates[templateName] || '<p>Default email</p>'
    });
  } catch (err) {
    console.error('Email send failed', err);
  }
};
