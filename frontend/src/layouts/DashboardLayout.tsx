import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Send, FileText, LogOut, Zap, PanelLeftClose, PanelLeft } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/contacts', label: 'Contacts', icon: <Users size={18} /> },
    { path: '/templates', label: 'Templates', icon: <FileText size={18} /> },
    { path: '/campaigns', label: 'Campaigns', icon: <Send size={18} /> },
  ];

  const sidebarWidth = collapsed ? '64px' : '220px';

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth, minWidth: sidebarWidth, maxWidth: sidebarWidth,
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease, min-width 0.25s ease, max-width 0.25s ease',
        overflow: 'hidden',
      }}>
        {/* Logo + Toggle */}
        <div style={{ padding: collapsed ? '1rem 0.75rem' : '1.25rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={14} color="white" />
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>OmniReach</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px',
            transition: 'color 0.15s',
          }}>
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.5rem', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} title={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px', textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                  fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease', whiteSpace: 'nowrap', overflow: 'hidden',
                }}>
                  <span style={{ color: isActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div style={{ padding: collapsed ? '0.75rem 0.5rem' : '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.6rem', overflow: 'hidden' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
              </div>
            </div>
          )}
          <button onClick={logout} title="Sign out" style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '7px 8px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: '6px',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s',
          }}>
            <LogOut size={14} /> {!collapsed && 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main id="main-scroll" style={{
        flex: 1, minWidth: 0,
        overflowY: 'auto', overflowX: 'hidden',
        padding: '1.5rem 1.5rem',
        background: 'var(--bg-deep)',
        backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(124,58,237,0.04), transparent 40%)',
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
