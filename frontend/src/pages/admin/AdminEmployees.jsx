import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { employeeAPI } from '../../api';
import { Plus, Pencil, Trash2, Save, X, Loader2, UserPlus, UserCheck, Search } from 'lucide-react';

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      animation: 'fadeUp 0.2s cubic-bezier(0.4,0,0.2,1) both'
    }}>
      <div style={{
        background: '#0e1929', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '1.5rem', width: '100%', maxWidth: 440,
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
        animation: 'fadeUp 0.25s cubic-bezier(0.4,0,0.2,1) both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0, color: 'white' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '0.625rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState({ name: '', employee_code: '' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');

  const load = () => {
    setLoading(true);
    employeeAPI.list().then(res => setEmployees(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', employee_code: '' }); setError(''); setModal('create'); };
  const openEdit   = (emp) => { setForm({ name: emp.name, employee_code: emp.employee_code }); setError(''); setModal(emp); };
  const closeModal = () => setModal(null);

  const handleSave = async () => {
    if (!form.name.trim() || !form.employee_code.trim()) { setError('Both fields are required.'); return; }
    setSaving(true); setError('');
    try {
      if (modal === 'create') await employeeAPI.create(form);
      else await employeeAPI.update(modal.id, form);
      closeModal(); load();
    } catch (err) {
      setError(err.response?.data?.employee_code?.[0] || err.response?.data?.name?.[0] || 'Something went wrong.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee? This cannot be undone.')) return;
    await employeeAPI.delete(id);
    load();
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Employee Management">
      {/* Header row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 0.2rem', color: 'white', letterSpacing: '-0.02em' }}>All Employees</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', margin: 0 }}>{employees.length} registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Search by name or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark"
          style={{ paddingLeft: '2.5rem', height: 42 }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1rem' }}>
          <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>Loading employees…</p>
        </div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'rgba(255,255,255,0.25)' }}>
          <UserPlus size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
          <p style={{ fontWeight: 600, margin: '0 0 0.375rem' }}>No employees yet</p>
          <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.7 }}>Click "Add Employee" to get started</p>
        </div>
      ) : (
        <div className="fade-up" style={{ background: 'rgba(11,18,32,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={14} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>Employee Directory</span>
            <span style={{ marginLeft: 'auto', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#c4b5fd', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {filtered.length} shown
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['#', 'Name', 'Employee Code', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp, i) => (
                  <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.04)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>{i + 1}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {emp.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'white' }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{emp.employee_code}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {emp.is_active ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600 }}>
                          <span style={{ width: 5, height: 5, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
                          Active
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600 }}>Inactive</span>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                        <button
                          onClick={() => openEdit(emp)}
                          style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.color = '#60a5fa'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#f87171'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Add New Employee' : `Edit — ${modal.name}`} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.82rem', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
              <input
                type="text" placeholder="e.g., Milankumar Biranwar"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-dark" style={{ height: 44 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.5rem', fontWeight: 500 }}>Employee Code</label>
              <input
                type="text" placeholder="e.g., SVT-001"
                value={form.employee_code} onChange={e => setForm(f => ({ ...f, employee_code: e.target.value }))}
                className="input-dark" style={{ height: 44, fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.375rem' }}>
              <button onClick={closeModal} className="btn-outline" style={{ flex: 1, height: 44 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, height: 44, gap: '0.5rem' }}>
                {saving ? <Loader2 size={15} style={{ animation: 'spin 0.9s linear infinite' }} /> : <Save size={15} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
