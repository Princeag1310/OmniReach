import API_BASE from '../config/api';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bot, Save, FileText, Settings, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const Templates = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([{ role: "model", parts: [{ text: "Hey! I'm your AI Email Co-Pilot. Tell me what kind of email you'd like to create." }] }]);
  const [inputVal, setInputVal] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [brandTone, setBrandTone] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchTemplates(); fetchProfile(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(API_BASE + '/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.companyName) setCompanyName(res.data.companyName);
      if (res.data.companyIndustry) setCompanyIndustry(res.data.companyIndustry);
      if (res.data.brandTone) setBrandTone(res.data.brandTone);
    } catch(err) {}
  };

  const fetchTemplates = async () => {
    try { const res = await axios.get(API_BASE + '/api/templates', { headers: { Authorization: `Bearer ${token}` } }); setSavedTemplates(res.data); } catch (err) {}
  };

  const saveProfile = async () => {
    try {
      await axios.put(API_BASE + '/api/auth/profile', { companyName, companyIndustry, brandTone }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Context saved!"); setShowSettings(false);
    } catch (err) { toast.error("Save failed."); }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const userMsg = { role: "user", parts: [{ text: inputVal }] };
    const chatHistory = [...messages.slice(1)];
    setMessages(prev => [...prev, userMsg]);
    setInputVal(''); setIsGenerating(true);
    try {
      const res = await axios.post(API_BASE + '/api/ai/chat', { message: userMsg.parts[0].text, history: chatHistory }, { headers: { Authorization: `Bearer ${token}` } });
      const text = res.data.parts[0].text;
      try {
        const clean = text.replace(/```json/g, "").replace(/```html/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(clean);
        if (parsed.subject && parsed.content) {
          setSubject(parsed.subject); setContent(parsed.content);
          setMessages(prev => [...prev, { role: "model", parts: [{ text: "✅ Email drafted! Check the editor and preview." }] }]);
          toast.success("Email drafted!"); setIsGenerating(false); return;
        }
      } catch (e) { setMessages(prev => [...prev, { role: "model", parts: [{ text }] }]); }
    } catch (err) { toast.error("AI error."); }
    finally { setIsGenerating(false); }
  };

  const handleSave = async () => {
    if (!content) return toast.error("Nothing to save!");
    try {
      await axios.post(API_BASE + '/api/templates', { name: templateName || "AI Generated Template", subject, htmlContent: content }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Saved!"); setTemplateName(''); fetchTemplates();
    } catch(err) { toast.error("Save failed."); }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Sparkles size={18} color="var(--accent)" /> AI Co-Pilot</h1>
          <p>Chat with AI to brainstorm and generate emails.</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', padding: '6px 12px' }}>
          <Settings size={13} /> Brand
        </button>
      </div>

      {showSettings && (
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1rem', border: '1px solid var(--primary)' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Company Context</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" style={{ fontSize: '0.8rem' }} />
            <input type="text" placeholder="Industry" value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} className="input-field" style={{ fontSize: '0.8rem' }} />
            <input type="text" placeholder="Tone" value={brandTone} onChange={e => setBrandTone(e.target.value)} className="input-field" style={{ fontSize: '0.8rem' }} />
          </div>
          <button onClick={saveProfile} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>Save</button>
        </div>
      )}

      {/* Two-column layout - fully flexible */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '0.75rem' }}>
        {/* Left: Chat + Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: '400px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bot color="var(--accent)" size={16} />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>AI Assistant</span>
            </div>
            <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', display: 'flex', gap: '5px' }}>
                  {m.role === 'model' && <Bot size={12} color="var(--accent)" style={{ marginTop: '6px', flexShrink: 0 }} />}
                  <div className={m.role === 'model' ? 'markdown-body' : ''} style={{
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-elevated)',
                    padding: '8px 12px', borderRadius: '10px',
                    borderTopRightRadius: m.role === 'user' ? '2px' : '10px',
                    borderTopLeftRadius: m.role === 'model' ? '2px' : '10px',
                    fontSize: '0.8rem', lineHeight: '1.45', wordBreak: 'break-word',
                  }}>
                    {m.role === 'model' ? <ReactMarkdown>{m.parts[0].text}</ReactMarkdown> : m.parts[0].text}
                  </div>
                </div>
              ))}
              {isGenerating && <div style={{ padding: '6px', color: 'var(--text-muted)', fontSize: '0.75rem' }} className="animate-pulse">Thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChat} style={{ padding: '0.6rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '6px' }}>
              <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} placeholder="Describe your email..." className="input-field" style={{ borderRadius: '18px', padding: '8px 14px', flex: 1, fontSize: '0.8rem' }} />
              <button type="submit" disabled={isGenerating} style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isGenerating ? 0.4 : 1 }}>
                <Send size={13} />
              </button>
            </form>
          </div>

          <div className="glass-panel" style={{ padding: '0.75rem 1rem', maxHeight: '160px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Saved Templates</h4>
            {savedTemplates.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None yet.</p>}
            {savedTemplates.map(t => (
              <div key={t._id} onClick={() => { setSubject(t.subject); setContent(t.htmlContent); setTemplateName(t.name); }}
                style={{ padding: '6px 8px', background: 'var(--bg-input)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginBottom: '3px' }}>
                {t.name}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editor + Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '6px', flexWrap: 'wrap' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', fontWeight: 600 }}><FileText size={14} color="var(--primary)" /> Editor</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" placeholder="Name" value={templateName} onChange={e => setTemplateName(e.target.value)} className="input-field" style={{ width: '120px', padding: '5px 8px', fontSize: '0.75rem' }} />
                <button onClick={handleSave} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '5px 10px', fontSize: '0.75rem', color: 'var(--success)' }}>
                  <Save size={11} /> Save
                </button>
              </div>
            </div>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' }}>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }} />
            <label style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' }}>HTML Source</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field" style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: '1.5' }} />
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.6rem' }}>Live Preview</h3>
            <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe srcDoc={content || "<div style='padding:20px;color:#aaa;font-family:sans-serif;text-align:center;font-size:14px;'>Email preview will appear here</div>"} style={{ width: '100%', height: '300px', border: 'none', display: 'block' }} title="Preview" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
