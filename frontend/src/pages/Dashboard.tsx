import API_BASE from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Send, CheckCircle, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="glass-panel" style={{ padding: '1rem 1.2rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <div style={{ color: color, opacity: 0.5 }}>{icon}</div>
    </div>
    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</h3>
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
      axios.get(API_BASE + '/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setStats(res.data)).catch(() => {});
    }
  }, [token]);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p>Here's your campaign performance overview.</p>
      </div>

      {/* Stats - using flex with wrap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <StatCard title="Contacts" value={stats.totalContacts} icon={<Users size={16} />} color="var(--primary)" />
        <StatCard title="Campaigns" value={stats.totalCampaigns} icon={<Send size={16} />} color="var(--accent)" />
        <StatCard title="Deliverability" value={stats.deliverability} icon={<CheckCircle size={16} />} color="var(--success)" />
        <StatCard title="Bounce Rate" value={stats.bounceRate} icon={<AlertTriangle size={16} />} color="var(--warning)" />
      </div>

      {/* Chart + Quick Actions - fully flexible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 280px)', gap: '0.75rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} color="var(--primary)" /> Weekly Performance
            </h3>
            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Live</span>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="none" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <YAxis stroke="none" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.75rem' }} />
                <Area type="monotone" dataKey="sent" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#gradSent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {[
              { label: 'New Campaign', desc: 'Send email blast', path: '/campaigns', primary: true },
              { label: 'AI Studio', desc: 'Draft with AI', path: '/templates', primary: false },
              { label: 'Import Contacts', desc: 'Upload CSV', path: '/contacts', primary: false },
            ].map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{
                background: a.primary ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--bg-elevated)',
                color: 'white', border: a.primary ? 'none' : '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '10px 12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{a.label}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '1px' }}>{a.desc}</div>
                </div>
                <ArrowRight size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
