import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceAPI, employeeAPI } from '../../api';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { formatHours } from '../../utils';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const statusStyle = {
  Present:  { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7'  },
  'Half Day': { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#fcd34d' },
  Leave:    { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#c4b5fd'  },
  Absent:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   text: '#fca5a5'  },
};

function StatusBadge({ status }) {
  const s = statusStyle[status] || statusStyle.Absent;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      padding: '0.2rem 0.65rem', borderRadius: '9999px',
      fontSize: '0.68rem', fontWeight: 600, display: 'inline-block', letterSpacing: '0.03em'
    }}>{status}</span>
  );
}

export default function EmployeeMonthlyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    attendanceAPI.monthly(id, year, month)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const fmtTime = (dt) => dt ? format(new Date(dt), 'hh:mm a') : '—';
  const totalPresent = data?.records.filter(r => r.status === 'Present').length || 0;
  const totalHalf    = data?.records.filter(r => r.status === 'Half Day').length || 0;
  const totalLeave   = data?.records.filter(r => r.status === 'Leave').length || 0;
  const totalHours   = formatHours(data?.records.reduce((acc, r) => acc + (parseFloat(r.total_hours) || 0), 0));

  const summaryCards = [
    { label: 'Present',    value: totalPresent, color: '#10b981', lightColor: '#6ee7b7', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
    { label: 'Half Days',  value: totalHalf,    color: '#f59e0b', lightColor: '#fcd34d', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    { label: 'Leaves',     value: totalLeave,   color: '#8b5cf6', lightColor: '#c4b5fd', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
    { label: 'Total Hrs',  value: totalHours,   color: '#3b82f6', lightColor: '#93c5fd', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #080e1a 0%, #0c1526 45%, #0a1220 100%)', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-80px', right: '-60px', width: 350, height: 350, background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(8,14,26,0.85)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            onClick={() => navigate(`/employee/${id}`)}
            style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: 'white', flexShrink: 0 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="avatar" style={{ width: 38, height: 38, fontSize: '0.95rem', flexShrink: 0 }}>
            {data?.employee?.name?.charAt(0) || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, lineHeight: 1.2, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data?.employee?.name || 'Attendance'}</p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.7rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{data?.employee?.employee_code}</p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.25rem 4rem' }}>

        {/* Month Selector */}
        <div className="fade-up" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem', padding: '0.75rem 1rem', marginBottom: '1.25rem'
        }}>
          <button
            onClick={prevMonth}
            style={{ width: 34, height: 34, borderRadius: '0.625rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0, color: 'white', letterSpacing: '-0.02em' }}>{MONTHS[month - 1]}</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', margin: 0 }}>{year}</p>
          </div>
          <button
            onClick={nextMonth}
            style={{ width: 34, height: 34, borderRadius: '0.625rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem', animationDelay: '0.05s' }}>
          {summaryCards.map(({ label, value, color, lightColor, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '1rem', padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'all 0.2s' }}>
              <div>
                <p style={{ color: lightColor, fontWeight: 800, fontSize: '2rem', margin: 0, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.2rem 0 0', fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>Loading records…</p>
          </div>
        ) : (
          <div className="fade-up" style={{ background: 'rgba(11,18,32,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden', animationDelay: '0.1s' }}>
            <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} style={{ color: '#60a5fa' }} />
              <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'rgba(255,255,255,0.7)' }}>Attendance Records — {MONTHS[month - 1]} {year}</span>
              <span style={{ marginLeft: 'auto', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                {data?.records?.length || 0} days
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Date', 'Day', 'In Time', 'Out Time', 'Total Hrs', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.records.map((record, i) => {
                    const d = new Date(record.date);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const today = new Date();
                    const isToday = d.toDateString() === today.toDateString();
                    return (
                      <tr key={i} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        background: isToday ? 'rgba(59,130,246,0.06)' : isWeekend ? 'rgba(255,255,255,0.015)' : 'transparent',
                        transition: 'background 0.15s'
                      }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                        onMouseOut={e => e.currentTarget.style.background = isToday ? 'rgba(59,130,246,0.06)' : isWeekend ? 'rgba(255,255,255,0.015)' : 'transparent'}
                      >
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontSize: '0.9rem', color: isToday ? '#60a5fa' : 'white' }}>
                          {d.getDate().toString().padStart(2, '0')}
                          {isToday && <span style={{ marginLeft: '0.375rem', fontSize: '0.62rem', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 600 }}>Today</span>}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: isWeekend ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                          {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#34d399', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>{fmtTime(record.sign_in_time)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#f87171', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>{fmtTime(record.sign_out_time)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem' }}>
                          {record.total_hours ? formatHours(parseFloat(record.total_hours)) : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}><StatusBadge status={record.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
