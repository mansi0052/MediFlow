import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/UI';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      showToast('Account created', 'success');
      navigate(form.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      console.error('Registration failed', err);
      showToast('Registration failed, please check your details', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-sage-100">
        <h1 className="font-display text-2xl font-semibold text-sage-600 mb-1">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Join MediFlow as a patient or doctor</p>
        <input
          className="w-full border border-sage-100 rounded-xl p-2.5 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border border-sage-100 rounded-xl p-2.5 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full border border-sage-100 rounded-xl p-2.5 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="w-full border border-sage-100 rounded-xl p-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>
        <Button type="submit" disabled={submitting} className="w-full justify-center">
          {submitting ? 'Creating account...' : 'Register'}
        </Button>
        <p className="mt-4 text-sm text-slate-500 text-center">
          Already have an account? <Link to="/login" className="text-sage-600 font-medium">Login</Link>
        </p>
      </form>
    </div>
  );
}