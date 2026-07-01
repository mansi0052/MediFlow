import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Card, SectionTitle, Button, Badge } from '../components/UI';
import { useSocket } from '../components/useSocket';
import api from '../api';

interface Appointment {
  _id: string;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  patientId: { _id: string; name: string; email: string };
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

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [prescribing, setPrescribing] = useState<Appointment | null>(null);
  const [medicineText, setMedicineText] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [viewingReportsFor, setViewingReportsFor] = useState<Appointment | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/doctors/me/appointments');
      setAppointments(data.appointments);
    } catch (err) {
      console.error('Failed to load appointments', err);
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useSocket(
    (event) => {
      if (event === 'appointment:statusChanged') {
        showToast('Your appointments were updated', 'info');
        loadAppointments();
      }
    },
    ['appointment:statusChanged']
  );

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}/status`, { status });
      showToast(`Appointment ${status}`, status === 'cancelled' ? 'info' : 'success');
      await loadAppointments();
    } catch (err) {
      console.error('Failed to update appointment', err);
      showToast('Failed to update appointment', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

 const viewReports = async (appt: Appointment) => {
    setViewingReportsFor(appt);
    setReportsLoading(true);
    try {
      const { data } = await api.get(`/reports/patient/${appt.patientId._id}`);
      setReports(data.reports);
    } catch (err) {
      console.error('Failed to load reports', err);
      showToast('Failed to load reports', 'error');
    } finally {
      setReportsLoading(false);
    }
  };

  const openPrescriptionForm = (appt: Appointment) => {
    setPrescribing(appt);
    setMedicineText('');
    setNotes('');
  };

  const submitPrescription = async () => {
    if (!prescribing) return;
    const medicines = medicineText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, dosage, duration] = line.split(',').map((s) => s.trim());
        return { name, dosage, duration };
      });

    setSaving(true);
    try {
      await api.post('/prescriptions', {
        appointmentId: prescribing._id,
        patientId: prescribing.patientId._id,
        medicines,
        notes
      });
      showToast('Prescription created', 'success');
      setPrescribing(null);
    } catch (err) {
      console.error('Failed to create prescription', err);
      showToast('Failed to create prescription', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-600">Doctor Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {user?.name}</p>
        </div>
        <Button variant="ghost" onClick={() => logout()}>Logout</Button>
      </div>

      {loading ? (
        <Card className="animate-pulse h-40 bg-sage-50" children={undefined} />
      ) : (
        <Card>
          <SectionTitle>My Appointments</SectionTitle>
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-400">No appointments yet.</p>
          ) : (
            <ul className="space-y-3">
              {appointments.map((appt) => (
                <li key={appt._id} className="border border-sage-100 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-700">{appt.patientId?.name}</p>
                      <p className="text-xs text-slate-400">{appt.patientId?.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(appt.date).toLocaleDateString()} · {appt.timeSlot}
                      </p>
                    </div>
                    <Badge tone={statusTone(appt.status)}>{appt.status}</Badge>
                  </div>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {appt.status === 'pending' && (
                      <>
                        <Button
                          disabled={updatingId === appt._id}
                          onClick={() => updateStatus(appt._id, 'confirmed')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="danger"
                          disabled={updatingId === appt._id}
                          onClick={() => updateStatus(appt._id, 'cancelled')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <>
                        <Button
                          disabled={updatingId === appt._id}
                          onClick={() => updateStatus(appt._id, 'completed')}
                        >
                          Mark Completed
                        </Button>
                        <Button variant="ghost" onClick={() => openPrescriptionForm(appt)}>
                          Write Prescription
                        </Button>
                      </>
                    )}
                    {appt.status === 'completed' && (
                      <Button variant="ghost" onClick={() => openPrescriptionForm(appt)}>
                        Write Prescription
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => viewReports(appt)}>
                      View Reports
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {prescribing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="font-display font-semibold text-lg text-sage-600 mb-3">
              Prescription for {prescribing.patientId?.name}
            </h2>
            <label className="text-sm text-slate-500">Medicines (one per line: name, dosage, duration)</label>
            <textarea
              className="w-full border border-sage-100 rounded-xl p-2 mb-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              rows={4}
              placeholder="Paracetamol, 500mg, 5 days"
              value={medicineText}
              onChange={(e) => setMedicineText(e.target.value)}
            />
            <label className="text-sm text-slate-500">Notes</label>
            <textarea
              className="w-full border border-sage-100 rounded-xl p-2 mb-3 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPrescribing(null)}>Cancel</Button>
              <Button disabled={saving} onClick={submitPrescription}>
                {saving ? 'Saving...' : 'Save Prescription'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {viewingReportsFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
            <h2 className="font-display font-semibold text-lg text-sage-600 mb-3">
              Reports for {viewingReportsFor.patientId?.name}
            </h2>
            {reportsLoading ? (
              <p className="text-sm text-slate-400">Loading...</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-slate-400">No reports uploaded yet.</p>
            ) : (
              <ul className="space-y-2 mb-4">
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
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setViewingReportsFor(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}