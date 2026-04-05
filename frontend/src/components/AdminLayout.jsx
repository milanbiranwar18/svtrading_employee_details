import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, FileEdit, LogOut, Menu, X, ChevronRight, Building2
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { path: '/admin',          icon: LayoutDashboard, label: 'Dashboard',  color: '#3b82f6' },
  { path: '/admin/employees',icon: Users,            label: 'Employees',  color: '#8b5cf6' },
  { path: '/admin/manual',   icon: CalendarCheck,   label: 'Attendance', color: '#10b981' },
  { path: '/admin/leaves',   icon: FileEdit,        label: 'Leaves',     color: '#f59e0b' },
];

export default function AdminLayout({ children, title }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#060c18', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: 240,
        background: 'rgba(10,16,30,0.98)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        zIndex: 40, transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: sidebarOpen ? '4px 0 40px rgba(0,0,0,0.5)' : 'none'
      }}
        className="lg-sidebar"
      >
        {/* Logo area */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              borderRadius: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
            }}>
              <Building2 size={19} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', margin: 0, color: 'white', lineHeight: 1.2 }}>SV Trading</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.625rem', marginBottom: '0.5rem' }}>Navigation</p>
          {NAV_ITEMS.map(({ path, icon: Icon, label, color }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => { navigate(path); setSidebarOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.625rem 0.875rem', borderRadius: '0.75rem',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500,
                  transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : 'rgba(255,255,255,0.5)',
                  borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                  marginLeft: active ? 0 : 0,
                }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; } }}
                onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '0.6rem', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `${color}20` : 'rgba(255,255,255,0.05)',
                }}>
                  <Icon size={16} style={{ color: active ? color : 'rgba(255,255,255,0.4)' }} />
                </div>
                {label}
                {active && <ChevronRight size={14} style={{ marginLeft: 'auto', color }} />}
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', marginBottom: '0.625rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '0.6rem', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.825rem', fontWeight: 600, margin: 0, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', margin: 0 }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'rgba(255,255,255,0.4)', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '0.825rem', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <LogOut size={15} /> Sign Out
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', color: 'rgba(255,255,255,0.35)', padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: 'Inter, sans-serif', fontSize: '0.825rem', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          >
            ← Employee Portal
          </button>
        </div>
      </aside>

      {/* Overlay when mobile sidebar is open */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 30, backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: 0 }}>
        {/* Top bar */}
        <header style={{
          background: 'rgba(8,14,26,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 1.5rem', height: 64,
          display: 'flex', alignItems: 'center', gap: '1rem',
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{ width: 36, height: 36, borderRadius: '0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0, color: 'white', letterSpacing: '-0.01em' }}>{title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', margin: 0 }}>SV Trading Admin</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px rgba(16,185,129,0.6)', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>System Online</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem 1.5rem', overflowAuto: 'auto', background: 'linear-gradient(160deg, #060c18 0%, #09111f 100%)' }}>
          {children}
        </main>
      </div>

      {/* Inline CSS for lg+ sidebar */}
      <style>{`
        @media (min-width: 1024px) {
          .lg-sidebar {
            transform: translateX(0) !important;
            position: sticky !important;
            height: 100vh !important;
            top: 0 !important;
          }
          .lg-sidebar + div, .lg-sidebar ~ div {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
