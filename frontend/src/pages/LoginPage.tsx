import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/UI';

export default function LoginPage() {
  const [email, setEmail] = useState('patient@mediflow.local');
  const [password, setPassword] = useState('patient123');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      console.error('Login failed', err);
      showToast('Invalid email or password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-sage-100">
        <h1 className="font-display text-2xl font-semibold text-sage-600 mb-1">Welcome back</h1>
        <p className="text-sm text-slate-500 mb-6">Log in to MediFlow</p>
        <input
          className="w-full border border-sage-100 rounded-xl p-2.5 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="w-full border border-sage-100 rounded-xl p-2.5 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button type="submit" disabled={submitting} className="w-full justify-center">
          {submitting ? 'Logging in...' : 'Login'}
        </Button>
        <p className="mt-4 text-sm text-slate-500 text-center">
          No account? <Link to="/register" className="text-sage-600 font-medium">Register</Link>
        </p>
      </form>
    </div>
  );
}