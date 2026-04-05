import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Activity, CheckCircle, Clock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const Campaigns = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [activeDispatch, setActiveDispatch] = useState<any>(null);

  useEffect(() => { fetchCampaigns(); fetchTemplates(); fetchContacts(); }, []);

  useEffect(() => {
    if (activeDispatch) {
      const socket = io('http://localhost:5001');
      socket.on(`campaignStatus:${activeDispatch.id}`, (data) => {
        setActiveDispatch((prev: any) => ({ ...prev, progress: data.progress, status: data.status, sent: data.sent, total: data.total }));
        if (data.status === 'COMPLETED') {
          toast.success("Dispatch completed!");
          setTimeout(() => { setActiveDispatch(null); fetchCampaigns(); }, 3000);
          socket.disconnect();
        }
      });
      return () => { socket.disconnect(); };
    }
  }, [activeDispatch]);

  const fetchCampaigns = async () => { try { const res = await axios.get('http://localhost:5001/api/campaigns', { headers: { Authorization: `Bearer ${token}` } }); setCampaigns(res.data); } catch (err) {} };
  const fetchTemplates = async () => { try { const res = await axios.get('http://localhost:5001/api/templates', { headers: { Authorization: `Bearer ${token}` } }); setTemplates(res.data); } catch (err) {} };
  const fetchContacts = async () => { try { const res = await axios.get('http://localhost:5001/api/contacts', { headers: { Authorization: `Bearer ${token}` } }); setContacts(res.data); } catch (err) {} };

  const handleTemplateSelect = (e: any) => {
    const id = e.target.value;
    if (!id) return;
    const t = templates.find(t => t._id === id);
    if (t) { setSubject(t.subject || ''); setContent(t.htmlContent || ''); }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { title, subject, content };
      if (selectedContacts.length > 0) payload.targetContacts = selectedContacts;
      if (scheduledAt) payload.scheduledAt = new Date(scheduledAt).toISOString();
      const res = await axios.post('http://localhost:5001/api/campaigns/send', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(res.data.message);
      if (!scheduledAt) setActiveDispatch({ id: res.data.campaignId, progress: 0, status: 'SENDING', sent: 0, total: res.data.totalTarget });
      setTitle(''); setSubject(''); setContent(''); setScheduledAt(''); setSelectedContacts([]);
      fetchCampaigns();
    } catch (err: any) { toast.error(err.response?.data?.error || "Failed"); }
  };

  const activeContacts = contacts.filter(c => !c.unsubscribed);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={18} color="var(--accent)" /> Campaigns</h1>
        <p>Launch email blasts and track delivery.</p>
      </div>

      {activeDispatch && (
        <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
              <Activity size={13} className="animate-pulse" /> {activeDispatch.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{activeDispatch.sent || 0}/{activeDispatch.total || 0}</span>
          </div>
          <div style={{ width: '100%', height: '5px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${activeDispatch.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      )}

      {/* Fully flexible grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 340px) minmax(0, 1fr)', gap: '0.75rem' }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>New Campaign</h3>
          <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input type="text" placeholder="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} required className="input-field" style={{ fontSize: '0.8rem' }} />
            <select onChange={handleTemplateSelect} className="input-field" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
              <option value="">Load Template</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <div style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block', fontWeight: 600 }}>
                Audience ({selectedContacts.length || 'All'})
              </label>
              <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
                {activeContacts.map(c => (
                  <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 0', cursor: 'pointer', fontSize: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)', width: '13px', height: '13px', cursor: 'pointer' }}
                      checked={selectedContacts.includes(c._id)}
                      onChange={(e) => { if (e.target.checked) setSelectedContacts(p => [...p, c._id]); else setSelectedContacts(p => p.filter(id => id !== c._id)); }}
                    />
                    {c.firstName || 'User'} <span style={{ color: 'var(--text-muted)' }}>({c.email})</span>
                  </label>
                ))}
                {activeContacts.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No contacts.</p>}
              </div>
            </div>

            <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required className="input-field" style={{ fontSize: '0.8rem' }} />
            <textarea placeholder="HTML Content" value={content} onChange={e => setContent(e.target.value)} required className="input-field" style={{ minHeight: '80px', resize: 'none', fontFamily: 'monospace', fontSize: '0.75rem' }} />

            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 600, marginBottom: '3px' }}>
                <Clock size={10} /> Schedule
              </label>
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="input-field" style={{ fontSize: '0.8rem' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', padding: '10px', fontSize: '0.85rem' }}>
              <Send size={14} /> {scheduledAt ? "Schedule" : "Launch Now"}
            </button>
          </form>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' }}>Preview</h3>
            <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe srcDoc={content ? content.replace(/{{firstName}}/g, "Demo User") : "<div style='padding:20px;color:#aaa;font-family:sans-serif;text-align:center;font-size:14px;'>Preview appears here</div>"} style={{ width: '100%', height: '300px', border: 'none', display: 'block' }} title="Preview" />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' }}>History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {campaigns.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No campaigns yet.</p> : null}
              {campaigns.map(c => (
                <div key={c._id} style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', gap: '8px' }}>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.subject}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={c.status === 'COMPLETED' ? 'badge badge-success' : 'badge badge-warning'}>
                      {c.status === 'COMPLETED' ? <CheckCircle size={9} /> : <Activity size={9} />} {c.status}
                    </span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '3px' }}>{c.stats.delivered}/{c.stats.totalSent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
