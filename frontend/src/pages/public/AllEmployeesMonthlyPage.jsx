import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI, employeeAPI } from '../../api';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { formatHours } from '../../utils';
import ExportModal from '../../components/ExportModal';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmtTime(dt) {
  if (!dt) return null;
  try { return format(new Date(dt), 'hh:mm'); } catch { return null; }
}

function statusColor(status) {
  if (status === 'Present')  return { bg: 'rgba(16,185,129,0.18)', text: '#6ee7b7', dot: '#10b981' };
  if (status === 'Half Day') return { bg: 'rgba(245,158,11,0.18)', text: '#fcd34d', dot: '#f59e0b' };
  if (status === 'Leave')    return { bg: 'rgba(139,92,246,0.18)', text: '#c4b5fd', dot: '#8b5cf6' };
  return { bg: 'rgba(239,68,68,0.14)', text: '#fca5a5', dot: '#ef4444' };
}

export default function AllEmployeesMonthlyPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [year,      setYear]      = useState(now.getFullYear());
  const [month,     setMonth]     = useState(now.getMonth() + 1);
  const [employees, setEmployees] = useState([]);
  const [allData,   setAllData]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    setLoading(true);
    employeeAPI.list().then(async (empRes) => {
      const emps = empRes.data;
      setEmployees(emps);
      const results = await Promise.all(emps.map(emp => attendanceAPI.monthly(emp.id, year, month)));
      const map = {};
      results.forEach((res, i) => { map[emps[i].id] = res.data.records; });
      setAllData(map);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, [year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const totalHrs = (empId) => {
    const records = allData[empId] || [];
    return formatHours(records.reduce((sum, r) => sum + (parseFloat(r.total_hours) || 0), 0));
  };

  const legend = [
    { label: 'Present',  color: '#10b981' },
    { label: 'Half Day', color: '#f59e0b' },
    { label: 'Leave',    color: '#8b5cf6' },
    { label: 'Absent',   color: '#ef4444' },
    { label: 'Weekend',  color: 'rgba(255,255,255,0.15)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #080e1a 0%, #0c1526 45%, #0a1220 100%)' }}>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(37,99,235,0.09) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(8,14,26,0.9)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.4)'
      }}>
        <div style={{ padding: '0 1.25rem', height: 64, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: 'white', letterSpacing: '-0.01em' }}>Monthly Attendance</h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', margin: 0 }}>All Employees — {MONTHS[month - 1]} {year}</p>
          </div>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '0.875rem', padding: '0.3rem' }}>
            <button
              onClick={prevMonth}
              style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '0 0.625rem', minWidth: 110, textAlign: 'center', color: 'white' }}>
              {MONTHS[month - 1]} {year}
            </span>
            <button
              onClick={nextMonth}
              style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          {/* Export Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0 1rem', height: 36, borderRadius: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </header>
      
      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        defaultYear={year} 
        defaultMonth={month} 
      />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>Loading attendance data…</p>
        </div>
      ) : (
        <div style={{ padding: '1.25rem' }}>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '0.25rem' }}>Legend:</span>
            {legend.map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', background: color, display: 'inline-block', flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>

          {/* Grid container */}
          <div style={{ background: 'rgba(11,18,32,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>

              {/* Fixed left: Employee names */}
              <div style={{ flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,14,26,0.95)', zIndex: 10, position: 'sticky', left: 0 }}>
                {/* Header */}
                <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 52 }}>
                  <div style={{ width: 190, display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Employee</div>
                  <div style={{ width: 80, display: 'flex', alignItems: 'center', padding: '0 0.75rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Code</div>
                </div>
                {/* Rows */}
                {employees.map((emp, i) => (
                  <div key={emp.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', height: 62, background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                    <div style={{ width: 190, display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0 0.75rem' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {emp.name.charAt(0)}
                      </div>
                      <span style={{ color: 'white', fontSize: '0.825rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</span>
                    </div>
                    <div style={{ width: 80, display: 'flex', alignItems: 'center', padding: '0 0.75rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', borderLeft: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {emp.employee_code}
                    </div>
                  </div>
                ))}
              </div>

              {/* Scrollable date columns */}
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <div style={{ minWidth: days.length * 88 + 90 }}>

                  {/* Date header row */}
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 52 }}>
                    {days.map(d => {
                      const date = new Date(year, month - 1, d);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const isToday = date.toDateString() === now.toDateString();
                      return (
                        <div key={d} style={{
                          width: 88, flexShrink: 0,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          borderRight: '1px solid rgba(255,255,255,0.04)',
                          background: isToday ? 'rgba(59,130,246,0.1)' : isWeekend ? 'rgba(255,255,255,0.025)' : 'transparent',
                        }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isToday ? '#60a5fa' : isWeekend ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.75)' }}>{String(d).padStart(2, '0')}</span>
                          <span style={{ fontSize: '0.65rem', color: isToday ? '#93c5fd' : 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                            {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                          </span>
                          {isToday && <span style={{ width: 4, height: 4, background: '#3b82f6', borderRadius: '50%', marginTop: 2 }} />}
                        </div>
                      );
                    })}
                    {/* Total hrs header */}
                    <div style={{ width: 90, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.08)' }}>
                      <span style={{ color: '#60a5fa', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                      <span style={{ color: '#93c5fd', fontSize: '0.62rem' }}>Hours</span>
                    </div>
                  </div>

                  {/* Employee data rows */}
                  {employees.map((emp, i) => {
                    const records = allData[emp.id] || [];
                    return (
                      <div key={emp.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', height: 62, background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                        {days.map(d => {
                          const date = new Date(year, month - 1, d);
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                          const isToday = date.toDateString() === now.toDateString();
                          const rec = records.find(r => new Date(r.date).getDate() === d);
                          const hasActivity = rec?.sign_in_time;
                          const status = rec?.status || (isWeekend ? 'Weekend' : 'Absent');
                          const sc = isWeekend && !hasActivity ? null : statusColor(status);

                          return (
                            <div
                              key={d}
                              style={{
                                width: 88, flexShrink: 0,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                borderRight: '1px solid rgba(255,255,255,0.03)',
                                background: isToday ? 'rgba(59,130,246,0.05)' : isWeekend ? 'rgba(255,255,255,0.01)' : 'transparent',
                                padding: '0.25rem',
                                gap: 2
                              }}
                            >
                              {isWeekend && !hasActivity ? (
                                <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: '1rem' }}>—</span>
                              ) : hasActivity ? (
                                <>
                                  <span style={{ color: '#34d399', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{fmtTime(rec.sign_in_time)}</span>
                                  <span style={{ color: '#f87171', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{fmtTime(rec.sign_out_time) || '—'}</span>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: sc?.text, background: sc?.bg, padding: '0.1rem 0.35rem', borderRadius: '4px', lineHeight: 1.4 }}>
                                    {rec.total_hours ? formatHours(parseFloat(rec.total_hours)) : status}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: sc?.text }}>Absent</span>
                              )}
                            </div>
                          );
                        })}
                        {/* Total hours cell */}
                        <div style={{ width: 90, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid rgba(59,130,246,0.15)', background: 'rgba(59,130,246,0.05)' }}>
                          <span style={{ color: '#93c5fd', fontWeight: 700, fontSize: '0.875rem', fontFamily: 'JetBrains Mono, monospace' }}>{totalHrs(emp.id)}h</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', textAlign: 'center', marginTop: '0.875rem' }}>
            ← Scroll horizontally to see all dates →
          </p>
        </div>
      )}
    </div>
  );
}
