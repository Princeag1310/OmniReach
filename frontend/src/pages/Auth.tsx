import API_BASE from '../config/api';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User as UserIcon, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(API_BASE + '/api/auth/login', { email, password });
        login(res.data.user, res.data.token);
        toast.success("Welcome back!");
      } else {
        const res = await axios.post(API_BASE + '/api/auth/register', { name, email, password });
        login(res.data.user, res.data.token);
        toast.success("Account created!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Auth failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: 'var(--bg-deep)',
      backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.08), transparent 50%), radial-gradient(circle at 70% 80%, rgba(244,114,182,0.06), transparent 50%)',
    }}>
      <div className="glass-panel animate-fade" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.5rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>OmniReach</span>
        </div>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.85rem' }}>
          {isLogin ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {!isLogin && (
            <div style={{ position: 'relative' }}>
              <UserIcon style={{ position: 'absolute', top: '11px', left: '12px', color: 'var(--text-muted)' }} size={16} />
              <input type="text" required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" style={{ paddingLeft: '36px' }} />
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', top: '11px', left: '12px', color: 'var(--text-muted)' }} size={16} />
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" style={{ paddingLeft: '36px' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', top: '11px', left: '12px', color: 'var(--text-muted)' }} size={16} />
            <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field" style={{ paddingLeft: '36px' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
