import { useState } from 'react';
import { X, Calendar, Download, CalendarRange, Clock } from 'lucide-react';
import { attendanceAPI } from '../api';

export default function ExportModal({ isOpen, onClose, defaultYear, defaultMonth }) {
  const [exportType, setExportType] = useState('month'); // 'month', 'day', 'range'
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  if (!isOpen) return null;

  const handleExport = () => {
    let params = {};
    if (exportType === 'month') {
      params = { year: defaultYear, month: defaultMonth };
    } else if (exportType === 'day') {
      if (!selectedDate) return;
      params = { date_from: selectedDate, date_to: selectedDate };
    } else if (exportType === 'range') {
      if (!startDate || !endDate) return;
      params = { date_from: startDate, date_to: endDate };
    }
    
    attendanceAPI.exportExcel(params);
    onClose();
  };

  const optionStyles = (active) => ({
    display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1rem',
    background: active ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: '0.75rem', cursor: 'pointer', transition: 'all 0.2s',
    color: active ? '#60a5fa' : 'rgba(255,255,255,0.6)'
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(5, 8, 15, 0.75)', backdropFilter: 'blur(8px)' }} />
      
      {/* Modal */}
      <div className="fade-up" style={{ position: 'relative', width: '100%', maxWidth: 420, background: 'linear-gradient(160deg, #101a30, #0a1122)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} style={{ color: '#34d399' }} /> Export Attendance Data
          </h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'gray', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }} onMouseOver={e=>e.currentTarget.style.color='white'} onMouseOut={e=>e.currentTarget.style.color='gray'}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Select the time period you want to export.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div onClick={() => setExportType('month')} style={optionStyles(exportType === 'month')}>
              <Calendar size={18} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: exportType === 'month' ? 'white' : 'rgba(255,255,255,0.85)' }}>Whole Month</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Export the currently selected month</div>
              </div>
            </div>

            <div onClick={() => setExportType('day')} style={optionStyles(exportType === 'day')}>
              <Clock size={18} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: exportType === 'day' ? 'white' : 'rgba(255,255,255,0.85)' }}>Single Day</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Export a specific date</div>
              </div>
            </div>

            <div onClick={() => setExportType('range')} style={optionStyles(exportType === 'range')}>
              <CalendarRange size={18} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: exportType === 'range' ? 'white' : 'rgba(255,255,255,0.85)' }}>Date Range</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Export from a start date to an end date</div>
              </div>
            </div>
          </div>

          {/* Dynamic Inputs */}
          {exportType === 'day' && (
            <div className="fade-up" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>SELECT DATE</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', fontFamily: 'inherit' }} />
            </div>
          )}

          {exportType === 'range' && (
            <div className="fade-up" style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>START DATE</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', fontFamily: 'inherit' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', fontWeight: 600 }}>END DATE</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', fontFamily: 'inherit' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.6rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>Cancel</button>
            <button onClick={handleExport} disabled={(exportType === 'day' && !selectedDate) || (exportType === 'range' && (!startDate || !endDate))} style={{ flex: 1, padding: '0.75rem', background: '#10b981', border: 'none', color: 'white', borderRadius: '0.6rem', fontWeight: 600, cursor: 'pointer', opacity: ((exportType === 'day' && !selectedDate) || (exportType === 'range' && (!startDate || !endDate))) ? 0.5 : 1, transition: 'all 0.2s' }} onMouseOver={e=>{if(!e.currentTarget.disabled) e.currentTarget.style.background='#059669'}} onMouseOut={e=>{if(!e.currentTarget.disabled) e.currentTarget.style.background='#10b981'}}>
              Download Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
