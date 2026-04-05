import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Send, FileText, LogOut, Zap } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
        <div className="animate-pulse" style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/contacts', label: 'Contacts', icon: <Users size={18} /> },
    { path: '/templates', label: 'Templates', icon: <FileText size={18} /> },
    { path: '/campaigns', label: 'Campaigns', icon: <Send size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        minWidth: '240px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={16} color="white" />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>OmniReach</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.75rem', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                  fontSize: '0.9rem', fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}>
                  <span style={{ color: isActive ? 'var(--primary)' : 'inherit' }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'white'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={logout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: '8px',
            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem',
            transition: 'all 0.15s ease',
          }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1.5rem 2rem',
        background: 'var(--bg-deep)',
        backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(124,58,237,0.06), transparent 40%), radial-gradient(circle at 80% 80%, rgba(244,114,182,0.04), transparent 40%)',
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
