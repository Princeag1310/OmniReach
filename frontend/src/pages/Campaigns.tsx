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
          toast.success("Campaign dispatch completed!");
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
    const templateId = e.target.value;
    if (!templateId) return;
    const selected = templates.find(t => t._id === templateId);
    if (selected) { setSubject(selected.subject || ''); setContent(selected.htmlContent || ''); }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { title, subject, content };
      if (selectedContacts.length > 0) payload.targetContacts = selectedContacts;
      if (scheduledAt) payload.scheduledAt = new Date(scheduledAt).toISOString();
      const res = await axios.post('http://localhost:5001/api/campaigns/send', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(res.data.message);
      if (!scheduledAt) { setActiveDispatch({ id: res.data.campaignId, progress: 0, status: 'SENDING', sent: 0, total: res.data.totalTarget }); }
      setTitle(''); setSubject(''); setContent(''); setScheduledAt(''); setSelectedContacts([]);
      fetchCampaigns();
    } catch (err: any) { toast.error(err.response?.data?.error || "Launch failed"); }
  };

  const activeContacts = contacts.filter(c => !c.unsubscribed);

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={22} color="var(--accent)" /> Campaigns</h1>
        <p>Launch email blasts and track real-time delivery.</p>
      </div>

      {/* Live Progress */}
      {activeDispatch && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
              <Activity size={14} className="animate-pulse" /> {activeDispatch.status}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activeDispatch.sent || 0} / {activeDispatch.total || 0}</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${activeDispatch.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))', transition: 'width 0.3s ease', borderRadius: '3px' }} />
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1rem' }}>
        {/* Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>New Campaign</h3>
          <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input type="text" placeholder="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} required className="input-field" />

            <select onChange={handleTemplateSelect} className="input-field" style={{ cursor: 'pointer' }}>
              <option value="">Load Template (Optional)</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            {/* Target Audience */}
            <div style={{ background: 'var(--bg-input)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block', fontWeight: 500 }}>
                Audience ({selectedContacts.length || 'All'})
              </label>
              <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                {activeContacts.map(c => (
                  <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', cursor: 'pointer', fontSize: '0.8rem', borderBottom: '1px solid var(--border)' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--accent)', width: '14px', height: '14px', cursor: 'pointer' }}
                      checked={selectedContacts.includes(c._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedContacts(prev => [...prev, c._id]);
                        else setSelectedContacts(prev => prev.filter(id => id !== c._id));
                      }}
                    />
                    <span>{c.firstName || 'User'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({c.email})</span>
                  </label>
                ))}
                {activeContacts.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No active contacts.</p>}
              </div>
            </div>

            <input type="text" placeholder="Email Subject" value={subject} onChange={e => setSubject(e.target.value)} required className="input-field" />
            <textarea placeholder="HTML Email Content" value={content} onChange={e => setContent(e.target.value)} required className="input-field" style={{ minHeight: '100px', resize: 'none', fontFamily: 'monospace', fontSize: '0.8rem' }} />

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                <Clock size={11} /> Schedule (Optional)
              </label>
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="input-field" />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '12px', marginTop: '4px' }}>
              <Send size={15} /> {scheduledAt ? "Schedule" : "Launch Now"}
            </button>
          </form>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          {/* Preview */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Preview</h3>
            <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe
                srcDoc={content ? content.replace(/{{firstName}}/g, "Demo User") : "<div style='padding:24px;color:#aaa;font-family:sans-serif;text-align:center;'>Preview appears here</div>"}
                style={{ width: '100%', height: '350px', border: 'none', display: 'block' }}
                title="Email Preview"
              />
            </div>
          </div>

          {/* History */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>Campaign History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {campaigns.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No campaigns launched yet.</p> : null}
              {campaigns.map(c => (
                <div key={c._id} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '2px' }}>{c.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.subject}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={c.status === 'COMPLETED' ? 'badge badge-success' : 'badge badge-warning'} style={{ marginBottom: '4px', display: 'inline-flex' }}>
                      {c.status === 'COMPLETED' ? <CheckCircle size={10} /> : <Activity size={10} />}
                      {c.status}
                    </span>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>{c.stats.delivered}/{c.stats.totalSent} delivered</p>
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
