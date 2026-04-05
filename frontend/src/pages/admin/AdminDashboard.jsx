import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { attendanceAPI } from '../../api';
import { ChevronLeft, ChevronRight, Download, Loader2, Users, TrendingUp, Clock, Calendar } from 'lucide-react';
import { formatHours } from '../../utils';
import ExportModal from '../../components/ExportModal';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const statusStyle = {
  Present:    { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  text: '#6ee7b7' },
  'Half Day': { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  text: '#fcd34d' },
  Leave:      { bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)',  text: '#c4b5fd' },
  Absent:     { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   text: '#fca5a5' },
};

function StatusBadge({ status }) {
  const s = statusStyle[status] || statusStyle.Absent;
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text, padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 600, display: 'inline-block', letterSpacing: '0.03em' }}>{status}</span>
  );
}

export default function AdminDashboard() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    attendanceAPI.dashboard(year, month)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year, month]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };
  const excelExport = () => attendanceAPI.exportExcel({ year, month });

  const totals = data?.employees?.reduce((acc, e) => ({
    present: acc.present + e.present_days,
    half:    acc.half + e.half_days,
    leave:   acc.leave + e.leave_days,
    hours:   acc.hours + e.total_hours,
  }), { present: 0, half: 0, leave: 0, hours: 0 });

  const statCards = totals ? [
    { label: 'Total Employees', value: data?.employees?.length || 0, icon: Users,     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)',  light: '#93c5fd' },
    { label: 'Avg Present Days',value: data?.employees?.length ? Math.round(totals.present / data.employees.length) : 0, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', light: '#6ee7b7' },
    { label: 'Total Leaves',    value: totals.leave, icon: Calendar,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)', light: '#c4b5fd' },
    { label: 'Total Work Hrs',  value: `${totals.hours.toFixed(0)}h`, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  light: '#fcd34d' },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      {/* Month Selector + Export */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.75rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem', padding: '0.3rem'
        }}>
          <button
            onClick={prevMonth}
            style={{ width: 34, height: 34, borderRadius: '0.625rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontWeight: 700, padding: '0 0.75rem', minWidth: 150, textAlign: 'center', fontSize: '0.9rem', color: 'white' }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            style={{ width: 34, height: 34, borderRadius: '0.625rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="btn-primary"
          style={{ gap: '0.5rem' }}
        >
          <Download size={15} /> Export Excel
        </button>
      </div>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        defaultYear={year} 
        defaultMonth={month} 
      />

      {/* Stat Cards */}
      {statCards.length > 0 && (
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          {statCards.map(({ label, value, icon: Icon, color, bg, border, light }) => (
            <div key={label} style={{
              background: bg, border: `1px solid ${border}`,
              borderRadius: '1.125rem', padding: '1.25rem 1.375rem',
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              transition: 'all 0.25s', cursor: 'default'
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}20`; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ color: light, fontWeight: 800, fontSize: '1.75rem', margin: 0, lineHeight: 1, fontFamily: 'JetBrains Mono, monospace' }}>{value}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '0.25rem 0 0', fontWeight: 500 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem 0', gap: '1rem' }}>
          <Loader2 size={32} style={{ color: '#3b82f6', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.875rem', margin: 0 }}>Loading dashboard…</p>
        </div>
      ) : (
        <div className="fade-up" style={{ background: 'rgba(11,18,32,0.8)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={14} style={{ color: '#3b82f6' }} />
            <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'rgba(255,255,255,0.7)' }}>Employee Attendance Summary</span>
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{MONTHS[month - 1]} {year}</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Employee', 'Code', 'Present', 'Half Days', 'Leaves', 'Total Hrs'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Employee' || h === 'Code' ? 'left' : 'center', padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!data?.employees?.length ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.875rem' }}>
                      No data for this period
                    </td>
                  </tr>
                ) : (
                  data.employees.map((emp, i) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(59,130,246,0.04)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {emp.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem' }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{emp.employee_code}</td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}><span style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>{emp.present_days}</span></td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}><span style={{ color: '#fcd34d', fontWeight: 700, fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>{emp.half_days}</span></td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center' }}><span style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>{emp.leave_days}</span></td>
                      <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', color: '#93c5fd', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 600 }}>{formatHours(emp.total_hours)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
