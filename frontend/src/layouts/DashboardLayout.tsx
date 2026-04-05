import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Send, FileText, LogOut } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/contacts', label: 'Contacts', icon: <Users size={20} /> },
    { path: '/templates', label: 'Templates', icon: <FileText size={20} /> },
    { path: '/campaigns', label: 'Campaigns', icon: <Send size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', background: 'var(--card-bg)', borderRight: 'var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '2rem' }}>
            OmniReach
          </h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), transparent)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary-color)' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}>
                  {item.icon}
                  <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: 'var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', padding: '2rem 3rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
