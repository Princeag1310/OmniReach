import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Send, CheckCircle, AlertTriangle, ArrowRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalContacts: 0, totalCampaigns: 0, deliverability: '0%', bounceRate: '0%' });

  // Mock data for visual appeal
  const performanceData = [
    { day: 'Mon', sent: 4000, opened: 2400 },
    { day: 'Tue', sent: 3000, opened: 1398 },
    { day: 'Wed', sent: 2000, opened: 9800 },
    { day: 'Thu', sent: 2780, opened: 3908 },
    { day: 'Fri', sent: 1890, opened: 4800 },
    { day: 'Sat', sent: 2390, opened: 3800 },
    { day: 'Sun', sent: 3490, opened: 4300 },
  ];

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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Chart Panel */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity color="#6366f1" size={20} /> 7-Day Performance
          </h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                <Area type="monotone" dataKey="sent" stroke="#6366f1" fillOpacity={1} fill="url(#colorSent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            <button onClick={() => navigate('/campaigns')} className="btn-primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
               Create New Campaign <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/templates')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
               Draft AI Template <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/contacts')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
               Bulk Import Leads <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
