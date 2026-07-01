import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Card, SectionTitle, Button, Badge } from '../components/UI';
import { useSocket } from '../components/useSocket';

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mediflow:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Doctor {
  _id: string;
  specialization: string;
  userId: { _id: string; name: string; email: string };
}

interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  status: string;
  doctorId: { name: string; email: string } | string;
}

interface Prescription {
  _id: string;
  medicines: { name: string; dosage: string; duration: string }[];
  notes?: string;
  createdAt: string;
}

interface Report {
  _id: string;
  fileUrl: string;
  type: string;
  createdAt: string;
}

const statusTone = (status: string): 'default' | 'success' | 'warning' | 'danger' => {
  if (status === 'pending') return 'warning';
  if (status === 'confirmed') return 'success';
  if (status === 'cancelled') return 'danger';
  return 'default';
};

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState('');
  const [uploading, setUploading] = useState(false);

  const [booking, setBooking] = useState<Doctor | null>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [doctorsRes, apptRes, presRes, reportsRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients/me/appointments'),
        api.get(`/prescriptions/patient/${user?.id}`),
        api.get(`/reports/patient/${user?.id}`)
      ]);
      setDoctors(doctorsRes.data.doctors);
      setAppointments(apptRes.data.appointments);
      setPrescriptions(presRes.data.prescriptions);
      setReports(reportsRes.data.reports);
    } catch (err) {
      console.error('Failed to load patient data', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
useSocket(
    (event) => {
      if (event === 'appointment:statusChanged') {
        showToast('An appointment was updated', 'info');
        loadAll();
      } else if (event === 'prescription:created') {
        showToast('A new prescription was added', 'success');
        loadAll();
      }
    },
    ['appointment:statusChanged', 'prescription:created']
  );

const uploadReport = async () => {
    if (!reportFile || !reportType.trim()) {
      showToast('Please choose a file and enter a report type', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', reportFile);
      formData.append('patientId', user?.id || '');
      formData.append('type', reportType.trim());
      await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Report uploaded', 'success');
      setReportFile(null);
      setReportType('');
      await loadAll();
    } catch (err: any) {
      console.error('Failed to upload report', err);
      showToast(err?.response?.data?.message || 'Failed to upload report', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openBookingForm = (doctor: Doctor) => {
    setBooking(doctor);
    setDate('');
    setTimeSlot('');
    setNotes('');
  };

  const submitBooking = async () => {
    if (!booking || !date || !timeSlot) {
      showToast('Please choose a date and time slot', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        doctorId: booking.userId._id,
        date,
        timeSlot,
        notes
      });
      showToast('Appointment requested', 'success');
      setBooking(null);
      await loadAll();
    } catch (err: any) {
      console.error('Failed to book appointment', err);
      showToast(err?.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-600">Patient Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
        </div>
        <Button variant="ghost" onClick={() => logout()}>Logout</Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="animate-pulse h-40 bg-sage-50" children={undefined} />
          <Card className="animate-pulse h-40 bg-sage-50" children={undefined} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <SectionTitle>Available Doctors</SectionTitle>
            {doctors.length === 0 ? (
              <p className="text-sm text-slate-400">No approved doctors yet.</p>
            ) : (
              <ul className="space-y-3">
                {doctors.map((doc) => (
                  <li key={doc._id} className="border border-sage-100 rounded-xl p-3">
                    <p className="font-medium text-slate-700">{doc.userId?.name}</p>
                    <p className="text-xs text-slate-400">{doc.specialization}</p>
                    <Button className="mt-2" onClick={() => openBookingForm(doc)}>
                      Book Appointment
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle>My Appointments</SectionTitle>
            {appointments.length === 0 ? (
              <p className="text-sm text-slate-400">No appointments yet.</p>
            ) : (
              <ul className="space-y-3">
                {appointments.map((appt) => (
                  <li key={appt._id} className="border border-sage-100 rounded-xl p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <p className="text-slate-700">
                        {appt.doctorId && typeof appt.doctorId === 'object' ? appt.doctorId.name : 'Doctor'} —{' '}
                        {new Date(appt.date).toLocaleDateString()} {appt.timeSlot}
                      </p>
                      <Badge tone={statusTone(appt.status)}>{appt.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="md:col-span-2">
            <SectionTitle>My Prescriptions</SectionTitle>
            {prescriptions.length === 0 ? (
              <p className="text-sm text-slate-400">No prescriptions yet.</p>
            ) : (
              <ul className="space-y-3">
                {prescriptions.map((pres) => (
                  <li key={pres._id} className="border border-sage-100 rounded-xl p-3 text-sm">
                    <p className="text-xs text-slate-400">{new Date(pres.createdAt).toLocaleDateString()}</p>
                    <ul className="list-disc ml-5 mt-1 text-slate-700">
                      {pres.medicines.map((med, i) => (
                        <li key={i}>{med.name} — {med.dosage} — {med.duration}</li>
                      ))}
                    </ul>
                    {pres.notes && <p className="text-slate-400 mt-1">Notes: {pres.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="md:col-span-2">
            <SectionTitle>My Reports</SectionTitle>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                type="file"
                onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                className="text-sm flex-1 border border-sage-100 rounded-xl p-2"
              />
              <input
                type="text"
                placeholder="Report type (e.g. Blood Test)"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="text-sm border border-sage-100 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-sage-400"
              />
              <Button disabled={uploading} onClick={uploadReport}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {reports.length === 0 ? (
              <p className="text-sm text-slate-400">No reports uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {reports.map((report) => (
                  <li key={report._id} className="border border-sage-100 rounded-xl p-3 text-sm flex justify-between items-center">
                    <div>
                      <p className="text-slate-700 font-medium">{report.type}</p>
                      <p className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <a href={report.fileUrl} target="_blank" rel="noreferrer" className="text-sage-600 text-sm font-medium">
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {booking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="font-display font-semibold text-lg text-sage-600 mb-3">
              Book {booking.userId?.name}
            </h2>
            <label className="text-sm text-slate-500">Date</label>
            <input
              type="date"
              className="w-full border border-sage-100 rounded-xl p-2 mb-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <label className="text-sm text-slate-500">Time Slot</label>
            <input
              type="text"
              placeholder="10:00 AM - 10:30 AM"
              className="w-full border border-sage-100 rounded-xl p-2 mb-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            />
            <label className="text-sm text-slate-500">Notes (optional)</label>
            <textarea
              className="w-full border border-sage-100 rounded-xl p-2 mb-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setBooking(null)}>Cancel</Button>
              <Button disabled={submitting} onClick={submitBooking}>
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}