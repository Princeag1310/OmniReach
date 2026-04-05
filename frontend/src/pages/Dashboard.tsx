import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Send, CheckCircle, AlertTriangle, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="glass-panel" style={{ padding: '1.2rem 1.4rem', flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</p>
      <div style={{ color: color, opacity: 0.6 }}>{icon}</div>
    </div>
    <h3 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</h3>
  </div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>({ totalContacts: 0, totalCampaigns: 0, deliverability: '0%', bounceRate: '0%', performanceData: [] });

  const performanceData = stats.performanceData?.length > 0 ? stats.performanceData : [
    { day: 'Mon', sent: 0 }, { day: 'Tue', sent: 0 }, { day: 'Wed', sent: 0 },
    { day: 'Thu', sent: 0 }, { day: 'Fri', sent: 0 }, { day: 'Sat', sent: 0 }, { day: 'Sun', sent: 0 },
  ];

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5001/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setStats(res.data))
        .catch(err => console.error("Error fetching stats", err));
    }
  }, [token]);

  const quickActions = [
    { label: 'Create Campaign', desc: 'Build and send an email blast', path: '/campaigns', gradient: 'linear-gradient(135deg, var(--primary), var(--accent))' },
    { label: 'AI Template Studio', desc: 'Chat with AI to draft emails', path: '/templates', gradient: '' },
    { label: 'Import Contacts', desc: 'Bulk upload via CSV', path: '/contacts', gradient: '' },
  ];

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p>Here's your campaign performance overview.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard title="Contacts" value={stats.totalContacts} icon={<Users size={18} />} color="var(--primary)" />
        <StatCard title="Campaigns" value={stats.totalCampaigns} icon={<Send size={18} />} color="var(--accent)" />
        <StatCard title="Deliverability" value={stats.deliverability} icon={<CheckCircle size={18} />} color="var(--success)" />
        <StatCard title="Bounce Rate" value={stats.bounceRate} icon={<AlertTriangle size={18} />} color="var(--warning)" />
      </div>

      {/* Chart + Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--primary)" /> Weekly Performance
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Live Data</span>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="none" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis stroke="none" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.8rem' }}
                  cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="sent" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#gradSent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{
                background: a.gradient || 'var(--bg-elevated)',
                color: 'white', border: a.gradient ? 'none' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
                transition: 'all 0.2s ease',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>{a.desc}</div>
                </div>
                <ArrowRight size={16} style={{ opacity: 0.6 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
