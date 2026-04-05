import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Send, CheckCircle, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `rgba(255,255,255,0.05)`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
      <h3 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ totalContacts: 0, totalCampaigns: 0, deliverability: '0%', bounceRate: '0%' });

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5001/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setStats(res.data))
        .catch(err => console.error("Error fetching stats", err));
    }
  }, [token]);

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--text-muted)' }}>Here's an overview of your campaign performance today.</p>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Contacts" value={stats.totalContacts} icon={<Users size={24} />} color="#6366f1" />
        <StatCard title="Total Campaigns" value={stats.totalCampaigns} icon={<Send size={24} />} color="#ec4899" />
        <StatCard title="Deliverability" value={stats.deliverability} icon={<CheckCircle size={24} />} color="#10b981" />
        <StatCard title="Bounced" value={stats.bounceRate} icon={<AlertTriangle size={24} />} color="#f59e0b" />
      </div>

      <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Active Campaigns</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', color: 'var(--text-muted)' }}>
          <p>No active campaigns at the moment.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
