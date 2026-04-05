import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Activity, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchContacts();
  }, []);

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

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/campaigns', { headers: { Authorization: `Bearer ${token}` } });
      setCampaigns(res.data);
    } catch (err) { }
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/templates', { headers: { Authorization: `Bearer ${token}` } });
      setTemplates(res.data);
    } catch (err) { }
  };

  const fetchContacts = async () => {
    try {
        const res = await axios.get('http://localhost:5001/api/contacts', { headers: { Authorization: `Bearer ${token}` } });
        setContacts(res.data);
    } catch (err) {}
  };

  const handleTemplateSelect = (e: any) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const selected = templates.find(t => t._id === templateId);
    if (selected) {
      setSubject(selected.subject || '');
      setContent(selected.htmlContent || '');
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { title, subject, content };
      if (selectedContacts.length > 0) payload.targetContacts = selectedContacts;
      if (scheduledAt) payload.scheduledAt = new Date(scheduledAt).toISOString();

      const res = await axios.post('http://localhost:5001/api/campaigns/send', payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(res.data.message);
      
      if (!scheduledAt) {
          setActiveDispatch({ id: res.data.campaignId, progress: 0, status: 'SENDING', sent: 0, total: res.data.totalTarget });
      }
      
      setTitle(''); setSubject(''); setContent(''); setScheduledAt(''); setSelectedContacts([]);
      fetchCampaigns();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to launch campaign");
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Campaign Control Center</h1>
        <p style={{ color: 'var(--text-muted)' }}>Launch broadcasts and track real-time delivery via WebSockets.</p>
      </header>

      {activeDispatch && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)' }}>
              <Activity className="animate-pulse" size={20} /> Active Dispatch: {activeDispatch.status}
            </h3>
            <span style={{ fontWeight: 600 }}>{activeDispatch.sent || 0} / {activeDispatch.total || 0} Sent</span>
          </div>
          
          <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${activeDispatch.progress}%`, height: '100%', 
              background: 'linear-gradient(90deg, #6366f1, #ec4899)', 
              transition: 'width 0.3s ease' 
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>New Blast</h3>
          <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="Internal Campaign Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
            
            <select onChange={handleTemplateSelect} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', appearance: 'none' }}>
              <option value="">-- Load from saved Template (Optional) --</option>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Target Audience (Leave empty to send to ALL subscribed contacts)</label>
              <select multiple value={selectedContacts} onChange={e => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedContacts(values);
              }} style={{ width: '100%', height: '80px', padding: '8px', background: 'rgba(0,0,0,0.4)', color: 'white', border: 'none', borderRadius: '4px' }}>
                {contacts.filter(c => !c.unsubscribed).map(c => (
                  <option key={c._id} value={c._id}>{c.firstName || 'User'} ({c.email})</option>
                ))}
              </select>
            </div>

            <input type="text" placeholder="Email Subject" value={subject} onChange={e => setSubject(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
            <textarea placeholder="HTML Email Content" value={content} onChange={e => setContent(e.target.value)} required style={{ width: '100%', minHeight: '150px', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', resize: 'none' }} />
            
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Schedule For (Optional, leave blank to send instantly)</label>
              <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
            </div>

            <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', marginTop: '10px' }}>
              <Send size={18} /> {scheduledAt ? "Schedule Campaign" : "Launch Campaign"}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Visual HTML Preview</h3>
            <div style={{ background: 'white', color: 'black', padding: '1rem', borderRadius: '8px', minHeight: '150px', width: '100%', overflow: 'auto', border: '1px solid #ccc' }}>
              <div dangerouslySetInnerHTML={{ __html: content ? content.replace(/{{firstName}}/g, "Demo User") : "<p style='color:#888'>Preview will appear here...</p>" }} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent Campaigns</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {campaigns.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No campaigns launched yet.</p> : null}
              {campaigns.map(c => (
                <div key={c._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: 'var(--glass-border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{c.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Subject: {c.subject}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: c.status === 'COMPLETED' ? '#10b981' : '#f59e0b', marginBottom: '4px' }}>
                      {c.status === 'COMPLETED' ? <CheckCircle size={16} /> : <Activity size={16} />} 
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.status}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.stats.delivered} / {c.stats.totalSent} Delivered</p>
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
