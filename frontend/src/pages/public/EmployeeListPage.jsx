import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeAPI } from '../../api';
import { Search, Users, ChevronRight, BarChart3, Building2 } from 'lucide-react';
import { formatHours } from '../../utils';

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    employeeAPI.list()
      .then(res => setEmployees(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_code.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #080e1a 0%, #0c1526 45%, #0a1220 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-120px', left: '-80px', width: 450, height: 450, background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-80px', right: '-80px', width: 350, height: 350, background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(8,14,26,0.88)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.25rem', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.35)', flexShrink: 0
            }}>
              <Building2 size={17} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, lineHeight: 1.2, letterSpacing: '-0.01em' }}>SV Trading</p>
              <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.65rem', margin: 0, letterSpacing: '0.05em' }}>ATTENDANCE PORTAL</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => navigate('/monthly-all')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', borderRadius: '0.6rem', padding: '0.35rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.color = '#93c5fd'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}>
              <BarChart3 size={12} /> Monthly
            </button>
            <button onClick={() => navigate('/admin/login')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)', borderRadius: '0.6rem', padding: '0.35rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}>
              Admin
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.25rem 3rem', position: 'relative', zIndex: 1 }}>

        {/* Compact hero */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.25rem 0.875rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.75rem', backdropFilter: 'blur(8px)' }}>
            <span style={{ width: 5, height: 5, background: '#60a5fa', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
            {today}
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            <span className="text-gradient-blue">Mark</span>{' '}
            <span style={{ color: 'white' }}>Attendance</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.85rem', margin: 0 }}>
            Tap your name to sign in or sign out
          </p>
        </div>

        {/* Search bar */}
        <div className="fade-up" style={{ position: 'relative', marginBottom: '1rem', animationDelay: '0.05s' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search by name or employee code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.25rem', height: 42, fontSize: '0.85rem' }}
          />
        </div>

        {/* Stats row — compact */}
        {employees.length > 0 && (
          <div className="fade-up" style={{ display: 'flex', gap: '0.625rem', marginBottom: '1rem', animationDelay: '0.08s' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.14)', borderRadius: '0.75rem', padding: '0.5rem 0.875rem' }}>
              <Users size={13} style={{ color: '#34d399', flexShrink: 0 }} />
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'JetBrains Mono, monospace' }}>{employees.length}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>Employees</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.625rem', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.14)', borderRadius: '0.75rem', padding: '0.5rem 0.875rem' }}>
              <Users size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />
              <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'JetBrains Mono, monospace' }}>{filtered.length}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>Showing</span>
            </div>
          </div>
        )}

        {/* Employee 2-column Grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.875rem' }}>
            <div style={{ width: 38, height: 38, border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', margin: 0 }}>Loading employees…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.2, display: 'block' }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No employees found</p>
          </div>
        ) : (
          <div
            className="fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.625rem',
              animationDelay: '0.1s'
            }}
          >
            {filtered.map((emp, i) => (
              <button
                key={emp.id}
                onClick={() => navigate(`/employee/${emp.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.875rem', padding: '0.7rem 0.875rem',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  fontFamily: 'inherit', width: '100%',
                  animationDelay: `${i * 30}ms`
                }}
                onMouseOver={e => {
                  e.currentTarget.style.background = 'rgba(59,130,246,0.09)';
                  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: '0.625rem', flexShrink: 0,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.95rem', fontWeight: 700, color: 'white'
                }}>
                  {emp.name.charAt(0)}
                </div>

                {/* Name & code */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', margin: '0.1rem 0 0', fontFamily: 'JetBrains Mono, monospace' }}>{emp.employee_code}</p>
                </div>

                {/* Today's Status */}
                {emp.today_status ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0, marginRight: '0.2rem' }}>
                    {emp.today_status.sign_in_time && !emp.today_status.sign_out_time ? (
                      <>
                        <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span style={{ width: 4, height: 4, background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                          Signed In
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace' }}>
                          {new Date(emp.today_status.sign_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    ) : emp.today_status.sign_out_time ? (
                      <>
                        <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span style={{ width: 4, height: 4, background: '#60a5fa', borderRadius: '50%', display: 'inline-block' }} />
                          Signed Out
                        </span>
                        <div style={{ display: 'flex', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace' }}>
                          <span>{new Date(emp.today_status.sign_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>-</span>
                          <span>{new Date(emp.today_status.sign_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span style={{ color: '#93c5fd', fontSize: '0.6rem', fontWeight: 600 }}>
                          {formatHours(parseFloat(emp.today_status.total_hours))}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>Absent</span>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: '0.2rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 600 }}>Absent</span>
                  </div>
                )}

                {/* Active dot + arrow */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
