import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { attendanceAPI, employeeAPI } from '../../api';
import {
  ArrowLeft, Clock, MapPin, LogIn, LogOut,
  CheckCircle, AlertCircle, Calendar, Loader2, Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { formatHours } from '../../utils';

/* ── Compact live clock ─────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
      <div>
        <p style={{
          fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em',
          margin: 0, lineHeight: 1,
          fontFamily: 'JetBrains Mono, monospace',
          background: 'linear-gradient(135deg, #f1f5f9 30%, #93c5fd 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
        }}>
          {time.toLocaleTimeString('en-IN')}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', margin: '0.2rem 0 0', fontWeight: 400 }}>
          {time.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16,185,129,0.6)', animation: 'pulse 2s ease-in-out infinite', marginLeft: 'auto', marginBottom: '0.25rem' }} />
        <span style={{ color: 'rgba(16,185,129,0.7)', fontSize: '0.65rem', fontWeight: 600 }}>Live</span>
      </div>
    </div>
  );
}

export default function EmployeeActionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [employee, setEmployee]           = useState(null);
  const [todayRecord, setTodayRecord]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [location, setLocation]           = useState('');
  const [locationLabel, setLocationLabel] = useState('Getting location…');
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const coords = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
        setLocation(coords);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          setLocationLabel((data.display_name || coords).split(',').slice(0, 2).join(', '));
        } catch {
          setLocationLabel(coords);
        }
        setLocationLoading(false);
      },
      () => {
        setLocation('Location unavailable');
        setLocationLabel('Location unavailable');
        setLocationLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    Promise.all([employeeAPI.list(), attendanceAPI.todayStatus(id)])
      .then(([empRes, statusRes]) => {
        const emp = empRes.data.find(e => e.id === parseInt(id));
        setEmployee(emp);
        if (statusRes.data?.id) setTodayRecord(statusRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = useCallback(async (type) => {
    setError(''); setSuccess('');
    setActionLoading(true);
    try {
      const photo = webcamRef.current?.getScreenshot() || null;
      const payload = { employee_id: id, photo, location };
      const res = type === 'sign-in'
        ? await attendanceAPI.signIn(payload)
        : await attendanceAPI.signOut(payload);
      setTodayRecord(res.data);
      setSuccess(type === 'sign-in'
        ? `Signed In at ${fmtTime(res.data.sign_in_time)}`
        : `Signed Out at ${fmtTime(res.data.sign_out_time)}`
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }, [id, location]);

  const fmtTime = (dt) => dt ? format(new Date(dt), 'hh:mm:ss a') : '--:--:--';

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #080e1a, #0c1526)' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
    </div>
  );

  const hasSignedIn  = !!todayRecord?.sign_in_time;
  const hasSignedOut = !!todayRecord?.sign_out_time;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #080e1a 0%, #0c1526 45%, #0a1220 100%)', position: 'relative' }}>

      {/* Hidden webcam for auto-capture */}
      <div style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }}>
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user', width: 320, height: 240 }} audio={false} />
      </div>

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '-80px', right: '-60px', width: 300, height: 300, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(8,14,26,0.9)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)'
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 1.25rem', height: 56, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/')}
            style={{ width: 34, height: 34, borderRadius: '0.7rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: 'white', flexShrink: 0 }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {employee?.name?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0, lineHeight: 1.2, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{employee?.name}</p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.68rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{employee?.employee_code}</p>
          </div>
          {hasSignedIn && !hasSignedOut && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '9999px', padding: '0.2rem 0.6rem', flexShrink: 0 }}>
              <span style={{ width: 5, height: 5, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ color: '#34d399', fontSize: '0.68rem', fontWeight: 600 }}>Active</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content — compact layout */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0.875rem 1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', zIndex: 1 }}>

        {/* Clock + Stats in one row */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
          {/* Clock card */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.875rem 1rem', gridColumn: '1 / -1' }}>
            <LiveClock />
          </div>
        </div>

        {/* Today's stats — 3 cols */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', animationDelay: '0.04s' }}>
          {[
            { label: 'In Time',   icon: LogIn,  val: fmtTime(todayRecord?.sign_in_time),  color: '#34d399', active: hasSignedIn },
            { label: 'Out Time',  icon: LogOut, val: fmtTime(todayRecord?.sign_out_time), color: '#f87171', active: hasSignedOut },
            { label: 'Total Hrs', icon: Clock,  val: todayRecord?.total_hours ? formatHours(parseFloat(todayRecord.total_hours)) : '--', color: '#60a5fa', active: hasSignedOut },
          ].map(({ label, icon: Icon, val, color, active }) => (
            <div key={label} style={{
              background: active ? `${color}10` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? `${color}22` : 'rgba(255,255,255,0.06)'}`,
              borderRadius: '0.75rem', padding: '0.55rem 0.5rem', textAlign: 'center',
              transition: 'all 0.3s'
            }}>
              <Icon size={11} style={{ color: active ? color : 'rgba(255,255,255,0.18)', margin: '0 auto 0.2rem', display: 'block' }} />
              <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.58rem', margin: '0 0 0.15rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
              <p style={{ color: active ? color : 'rgba(255,255,255,0.15)', fontWeight: 700, fontSize: '0.72rem', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Location — single line compact */}
        <div className="fade-up" style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.14)',
          borderRadius: '0.75rem', padding: '0.6rem 0.875rem',
          animationDelay: '0.06s'
        }}>
          <MapPin size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {locationLoading ? 'Detecting location…' : locationLabel}
            </p>
          </div>
        </div>

        {/* ── PHOTO PREVIEWS & LIVE CAMERA ── */}
        <div className="fade-up" style={{ 
          display: 'grid', 
          gridTemplateColumns: hasSignedIn ? '1fr 1fr' : '1fr', 
          gap: '0.75rem', 
          animationDelay: '0.08s' 
        }}>
          
          {/* Sign In Detail Card (Show if already signed in) */}
          {hasSignedIn && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <LogIn size={11} style={{ color: '#34d399' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600 }}>Sign-In Info</span>
              </div>
              <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', height: 100, background: '#000', position: 'relative', marginBottom: '0.4rem' }}>
                {todayRecord?.sign_in_photo ? (
                  <img src={todayRecord.sign_in_photo.startsWith('http') ? todayRecord.sign_in_photo : `http://localhost:8000${todayRecord.sign_in_photo}`} alt="Sign In" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>No Photo</div>
                )}
              </div>
              <p style={{ color: '#34d399', fontSize: '0.65rem', margin: '0 0 0.1rem', fontWeight: 600 }}>{fmtTime(todayRecord.sign_in_time)}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {todayRecord.sign_in_location || 'Location missing'}
              </p>
            </div>
          )}

          {/* Sign Out Detail Card (Show if already signed out) */}
          {hasSignedOut && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <LogOut size={11} style={{ color: '#f87171' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600 }}>Sign-Out Info</span>
              </div>
              <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', height: 100, background: '#000', position: 'relative', marginBottom: '0.4rem' }}>
                {todayRecord?.sign_out_photo ? (
                  <img src={todayRecord.sign_out_photo.startsWith('http') ? todayRecord.sign_out_photo : `http://localhost:8000${todayRecord.sign_out_photo}`} alt="Sign Out" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)' }}>No Photo</div>
                )}
              </div>
              <p style={{ color: '#f87171', fontSize: '0.65rem', margin: '0 0 0.1rem', fontWeight: 600 }}>{fmtTime(todayRecord.sign_out_time)}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.55rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {todayRecord.sign_out_location || 'Location missing'}
              </p>
            </div>
          )}

          {/* Live Camera (Show if they still need to sign in or sign out) */}
          {!hasSignedOut && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Camera size={11} style={{ color: '#60a5fa' }} />
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 600 }}>
                  {hasSignedIn ? 'Take Sign-Out Photo' : 'Take Sign-In Photo'}
                </span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#10b981', fontSize: '0.55rem', border: '1px solid rgba(16,185,129,0.2)', padding: '0.1rem 0.35rem', borderRadius: '999px' }}>
                  <span style={{ width: 4, height: 4, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' }} />
                  LIVE
                </span>
              </div>
              <div style={{ borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', height: 100, background: '#000', position: 'relative' }}>
                <Webcam screenshotFormat="image/jpeg" videoConstraints={{ facingMode: 'user' }} audio={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}
        </div>

        {/* Status banner */}
        {hasSignedIn && (
          <div className="fade-up" style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem', borderRadius: '0.875rem',
            background: hasSignedOut ? 'rgba(59,130,246,0.09)' : 'rgba(16,185,129,0.09)',
            border: `1px solid ${hasSignedOut ? 'rgba(59,130,246,0.2)' : 'rgba(16,185,129,0.2)'}`,
            animationDelay: '0.1s'
          }}>
            <CheckCircle size={16} style={{ color: hasSignedOut ? '#60a5fa' : '#34d399', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.82rem', margin: '0 0 0.1rem', color: hasSignedOut ? '#93c5fd' : '#6ee7b7' }}>
                {hasSignedOut ? `Day Complete — ${todayRecord.status}` : 'Signed In Successfully'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                {hasSignedOut ? `${formatHours(parseFloat(todayRecord.total_hours))} hours worked` : `Since ${fmtTime(todayRecord.sign_in_time)}`}
              </p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.75rem 0.875rem', background: 'rgba(239,68,68,0.09)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.875rem', animation: 'fadeUp 0.3s both' }}>
            <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: '#fca5a5', fontSize: '0.82rem', margin: 0 }}>{error}</p>
          </div>
        )}
        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 0.875rem', background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.875rem', animation: 'fadeUp 0.3s both' }}>
            <CheckCircle size={15} style={{ color: '#34d399', flexShrink: 0 }} />
            <p style={{ color: '#6ee7b7', fontSize: '0.82rem', fontWeight: 600, margin: 0 }}>✓ {success}</p>
          </div>
        )}

        {/* ── SIGN IN / SIGN OUT BUTTONS ── */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', animationDelay: '0.12s' }}>
          <button
            disabled={hasSignedIn || actionLoading || locationLoading}
            onClick={() => handleAction('sign-in')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.3rem', padding: '0.875rem',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: 'none', borderRadius: '0.875rem', cursor: 'pointer',
              fontFamily: 'inherit', color: 'white',
              boxShadow: '0 4px 18px rgba(16,185,129,0.3)',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              opacity: (hasSignedIn || actionLoading || locationLoading) ? 0.42 : 1,
            }}
            onMouseOver={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(16,185,129,0.5)'; }}}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(16,185,129,0.3)'; }}
          >
            {actionLoading ? <Loader2 size={20} style={{ animation: 'spin 0.9s linear infinite' }} /> : <LogIn size={20} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Sign In</span>
          </button>

          <button
            disabled={!hasSignedIn || hasSignedOut || actionLoading}
            onClick={() => handleAction('sign-out')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.3rem', padding: '0.875rem',
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              border: 'none', borderRadius: '0.875rem', cursor: 'pointer',
              fontFamily: 'inherit', color: 'white',
              boxShadow: '0 4px 18px rgba(239,68,68,0.24)',
              transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
              opacity: (!hasSignedIn || hasSignedOut || actionLoading) ? 0.42 : 1,
            }}
            onMouseOver={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(239,68,68,0.45)'; }}}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(239,68,68,0.24)'; }}
          >
            {actionLoading ? <Loader2 size={20} style={{ animation: 'spin 0.9s linear infinite' }} /> : <LogOut size={20} />}
            <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Sign Out</span>
          </button>
        </div>

        {/* Bottom nav */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', animationDelay: '0.14s' }}>
          <button onClick={() => navigate(`/employee/${id}/monthly`)} className="btn-outline" style={{ padding: '0.5rem', gap: '0.35rem', fontSize: '0.75rem' }}>
            <Calendar size={13} /> My Attendance
          </button>
          <button onClick={() => navigate('/monthly-all')} className="btn-outline" style={{ padding: '0.5rem', gap: '0.35rem', fontSize: '0.75rem' }}>
            <Calendar size={13} /> All Employees
          </button>
        </div>

      </div>
    </div>
  );
}
