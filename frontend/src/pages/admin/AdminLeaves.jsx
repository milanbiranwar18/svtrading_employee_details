import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { attendanceAPI, employeeAPI } from '../../api';
import { Plus, CheckCircle, XCircle, Clock, Loader2, AlertCircle, FileEdit } from 'lucide-react';
import { format } from 'date-fns';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Emergency Leave', 'Unpaid Leave'];

const statusConfig = {
  Pending:  { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#fcd34d', dot: '#f59e0b' },
  Approved: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7', dot: '#10b981' },
  Rejected: { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   text: '#fca5a5', dot: '#ef4444' },
};

function StatusBadge({ status }) {
  const s = statusConfig[status] || statusConfig.Pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: s.bg, border: `1px solid ${s.border}`, color: s.text, padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600 }}>
      <span style={{ width: 4, height: 4, background: s.dot, borderRadius: '50%', display: 'inline-block' }} />
      {status}
    </span>
  );
}

export default function AdminLeaves() {
  const [leaves, setLeaves]       = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ employee: '', leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([attendanceAPI.leaves.list(), employeeAPI.list()])
      .then(([lr, er]) => { setLeaves(lr.data); setEmployees(er.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.employee || !form.start_date || !form.end_date) { setError('Employee, start date, and end date are required.'); return; }
    setSaving(true);
    try {
      await attendanceAPI.leaves.create(form);
      setShowForm(false);
      setForm({ employee: '', leave_type: 'Sick Leave', start_date: '', end_date: '', reason: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Failed to apply leave.');
    } finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    await attendanceAPI.leaves.update(id, { status });
    load();
  };

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  return (
    <AdminLayout title="Leave Management">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0, color: 'white', letterSpacing: '-0.02em' }}>Leave Requests</h2>
            {pendingCount > 0 && (
              <span style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '9999px' }}>
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>{leaves.length} total requests</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary" style={{ gap: '0.5rem' }}>
          {showForm ? <XCircle size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Apply Leave'}
        </button>
      </div>

      {/* Apply Leave Form */}
      {showForm && (
        <div className="fade-up" style={{ background: 'rgba(11,18,32,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <FileEdit size={15} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontWeight: 700, fontSize: '0.925rem', margin: 0, color: 'white' }}>Apply New Leave</h3>
          </div>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.82rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 500 }}>Employee</label>
                <select value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))} className="input-dark" required style={{ height: 42 }}>
                  <option value="">Select employee…</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 500 }}>Leave Type</label>
                <select value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))} className="input-dark" style={{ height: 42 }}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 500 }}>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="input-dark" required style={{ height: 42 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 500 }}>End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="input-dark" required style={{ height: 42 }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', fontWeight: 500 }}>Reason (optional)</label>
              <textarea
                value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Reason for leave…" rows={2}
                className="input-dark" style={{ resize: 'none', lineHeight: 1.5 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, height: 44 }}>Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, height: 44, gap: '0.5rem' }}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Plus size={15} />}
                {saving ? 'Applying…' : 'Apply Leave'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1rem' }}>
          <Loader2 size={32} style={{ color: '#f59e0b', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>Loading leave requests…</p>
        </div>
      ) : leaves.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'rgba(255,255,255,0.25)' }}>
          <Clock size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.25 }} />
          <p style={{ fontWeight: 600, margin: '0 0 0.375rem' }}>No leave requests</p>
          <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.7 }}>Click "Apply Leave" to submit a new request</p>
        </div>
      ) : (
        <div className="fade-up" style={{ background: 'rgba(11,18,32,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileEdit size={14} style={{ color: '#f59e0b' }} />
            <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Leave Request Log</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Employee', 'Type', 'From', 'To', 'Reason', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 6 ? 'center' : 'left', padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(245,158,11,0.03)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'white' }}>{leave.employee_name}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' }}>{leave.leave_type}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{leave.start_date}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{leave.end_date}</td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.4)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{leave.reason || '—'}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={leave.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {leave.status === 'Pending' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                          <button
                            onClick={() => handleStatus(leave.id, 'Approved')}
                            title="Approve"
                            style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => handleStatus(leave.id, 'Rejected')}
                            title="Reject"
                            style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', display: 'block', textAlign: 'center' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
