import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { attendanceAPI, employeeAPI } from '../../api';
import { Save, Loader2, CalendarDays, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Present',  color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  { value: 'Half Day', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  { value: 'Absent',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
  { value: 'Leave',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
];

const label = (text) => (
  <label style={{
    display: 'block', fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)',
    marginBottom: '0.375rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.07em'
  }}>{text}</label>
);

export default function AdminManualAttendance() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    sign_in_time: '09:00',
    sign_out_time: '18:00',
    status: 'Present',
    location: 'Manual Entry',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    employeeAPI.list().then(res => setEmployees(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.employee_id) { setError('Please select an employee.'); return; }
    setSaving(true);
    try {
      await attendanceAPI.manualUpdate(form);
      setSuccess('Attendance record saved successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Manual Attendance">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Page heading — compact */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0 0 0.2rem', color: 'white', letterSpacing: '-0.02em' }}>
            Manual Attendance Entry
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: 0 }}>
            Create or correct records when the system was unavailable.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.6rem 0.875rem', borderRadius: '0.75rem', marginBottom: '0.875rem', fontSize: '0.82rem', animation: 'fadeUp 0.3s both' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '0.6rem 0.875rem', borderRadius: '0.75rem', marginBottom: '0.875rem', fontSize: '0.82rem', fontWeight: 600, animation: 'fadeUp 0.3s both' }}>
            <CheckCircle size={14} style={{ flexShrink: 0 }} /> {success}
          </div>
        )}

        {/* Form card — single compact block */}
        <form onSubmit={handleSubmit}>
          <div style={{ background: 'rgba(11,18,32,0.85)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.125rem', overflow: 'hidden' }}>

            {/* Row 1: Employee + Date side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Employee */}
              <div style={{ padding: '0.875rem 1.125rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                {label('Employee *')}
                <select
                  value={form.employee_id}
                  onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))}
                  className="input-dark" required
                  style={{ height: 38, fontSize: '0.82rem', padding: '0 0.75rem' }}
                >
                  <option value="">Select…</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ padding: '0.875rem 1.125rem' }}>
                {label('Date *')}
                <div style={{ position: 'relative' }}>
                  <CalendarDays size={13} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#60a5fa', pointerEvents: 'none' }} />
                  <input
                    type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="input-dark" required
                    style={{ paddingLeft: '2.125rem', height: 38, fontSize: '0.82rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Sign-in + Sign-out times */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ padding: '0.875rem 1.125rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.375rem' }}>
                  <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                  {label('Sign-In Time')}
                </div>
                <div style={{ position: 'relative' }}>
                  <Clock size={12} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#34d399', pointerEvents: 'none' }} />
                  <input type="time" value={form.sign_in_time}
                    onChange={e => setForm(f => ({ ...f, sign_in_time: e.target.value }))}
                    className="input-dark" style={{ paddingLeft: '2rem', height: 38, fontSize: '0.82rem' }} />
                </div>
              </div>
              <div style={{ padding: '0.875rem 1.125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.375rem' }}>
                  <span style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
                  {label('Sign-Out Time')}
                </div>
                <div style={{ position: 'relative' }}>
                  <Clock size={12} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#f87171', pointerEvents: 'none' }} />
                  <input type="time" value={form.sign_out_time}
                    onChange={e => setForm(f => ({ ...f, sign_out_time: e.target.value }))}
                    className="input-dark" style={{ paddingLeft: '2rem', height: 38, fontSize: '0.82rem' }} />
                </div>
              </div>
            </div>

            {/* Row 3: Status — 4 compact toggle buttons */}
            <div style={{ padding: '0.875rem 1.125rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {label('Status *')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {STATUS_OPTIONS.map(s => (
                  <button
                    type="button" key={s.value}
                    onClick={() => setForm(f => ({ ...f, status: s.value }))}
                    style={{
                      padding: '0.5rem 0.25rem', borderRadius: '0.625rem',
                      fontSize: '0.8rem', fontWeight: 600,
                      border: `1px solid ${form.status === s.value ? s.border : 'rgba(255,255,255,0.07)'}`,
                      background: form.status === s.value ? s.bg : 'rgba(255,255,255,0.025)',
                      color: form.status === s.value ? s.color : 'rgba(255,255,255,0.4)',
                      cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: form.status === s.value ? s.color : 'rgba(255,255,255,0.15)', display: 'inline-block', flexShrink: 0 }} />
                    {s.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Location note */}
            <div style={{ padding: '0.875rem 1.125rem' }}>
              {label('Location Note')}
              <div style={{ position: 'relative' }}>
                <MapPin size={12} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.28)', pointerEvents: 'none' }} />
                <input
                  type="text" placeholder="e.g., Office, Work From Home…"
                  value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="input-dark" style={{ paddingLeft: '2rem', height: 38, fontSize: '0.82rem' }}
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit" disabled={saving}
            className="btn-primary"
            style={{ width: '100%', height: 46, marginTop: '0.875rem', fontSize: '0.9rem', fontWeight: 700, gap: '0.5rem' }}
          >
            {saving ? <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Attendance Record'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
