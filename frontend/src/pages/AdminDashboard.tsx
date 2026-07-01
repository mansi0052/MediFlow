import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Card, SectionTitle, Button, Badge } from '../components/UI';
import { useSocket } from '../components/useSocket';
import api from '../api';

interface DoctorProfile {
  _id: string;
  specialization: string;
  verificationStatus: string;
  userId: { name: string; email: string };
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [pending, setPending] = useState<DoctorProfile[]>([]);
  const [stats, setStats] = useState<{ patients: number; doctors: number; appointments: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, statsRes] = await Promise.all([
        api.get('/admin/doctors/pending'),
        api.get('/admin/stats')
      ]);
      setPending(pendingRes.data.doctors);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Failed to load admin data', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

useSocket(
    (event) => {
      if (event === 'doctor:newRegistration') {
        showToast('A new doctor registered', 'info');
        loadData();
      }
    },
    ['doctor:newRegistration']
  );
  const verify = async (id: string, status: 'approved' | 'rejected') => {
    setActingOn(id);
    try {
      await api.put(`/admin/doctors/${id}/verify`, { status });
      showToast(`Doctor ${status}`, status === 'approved' ? 'success' : 'info');
      await loadData();
    } catch (err) {
      console.error('Verification failed', err);
      showToast('Verification failed', 'error');
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-sage-600">Admin Dashboard</h1>
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
            <SectionTitle>Pending Doctor Approvals</SectionTitle>
            {pending.length === 0 ? (
              <p className="text-sm text-slate-400">No pending doctors right now.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((doc) => (
                  <li key={doc._id} className="border border-sage-100 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-700">{doc.userId?.name}</p>
                        <p className="text-xs text-slate-400">{doc.userId?.email}</p>
                        <p className="text-xs text-slate-400 mt-1">Specialization: {doc.specialization}</p>
                      </div>
                      <Badge tone="warning">pending</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="primary"
                        disabled={actingOn === doc._id}
                        onClick={() => verify(doc._id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        disabled={actingOn === doc._id}
                        onClick={() => verify(doc._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <SectionTitle>Platform Statistics</SectionTitle>
            {stats && (
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex justify-between"><span>Patients</span><span className="font-semibold text-sage-600">{stats.patients}</span></li>
                <li className="flex justify-between"><span>Doctors</span><span className="font-semibold text-sage-600">{stats.doctors}</span></li>
                <li className="flex justify-between"><span>Appointments</span><span className="font-semibold text-sage-600">{stats.appointments}</span></li>
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}