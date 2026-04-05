import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) { navigate('/admin'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin');
    } catch {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060c18 0%, #0c1526 50%, #091220 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', position: 'relative', overflow: 'hidden'
    }}>

      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-150px', left: '-100px', width: 500, height: 500, background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-100px', right: '-80px', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 72, height: 72, margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
            borderRadius: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(37,99,235,0.4)',
            animation: 'glow-pulse 2.5s ease-in-out infinite'
          }}>
            <ShieldCheck size={34} color="white" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.375rem', letterSpacing: '-0.03em', color: 'white' }}>
            Admin Portal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.875rem', margin: 0 }}>SV Trading Attendance System</p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
        }}>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#fca5a5', fontSize: '0.85rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem',
              animation: 'fadeUp 0.3s cubic-bezier(0.4,0,0.2,1) both'
            }}>
              <Lock size={14} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 500, letterSpacing: '0.01em' }}>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                className="input-field"
                style={{ height: 46 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontWeight: 500, letterSpacing: '0.01em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="input-field"
                  style={{ height: 46, paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s', padding: 0 }}
                  onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                  onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ height: 48, fontSize: '0.9rem', fontWeight: 700, marginTop: '0.375rem', gap: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Lock size={16} />}
              {loading ? 'Signing in…' : 'Sign In to Admin'}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginBottom: '0.75rem' }}>Default credentials: admin / admin123</p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem',
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontFamily: 'Inter, sans-serif', transition: 'color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <ArrowLeft size={14} /> Back to Employee Portal
          </button>
        </div>
      </div>
    </div>
  );
}
