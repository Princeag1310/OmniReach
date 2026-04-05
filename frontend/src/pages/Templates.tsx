import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bot, Save, FileText, Settings, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

const Templates = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([{ role: "model", parts: [{ text: "Hey! I'm your AI Email Co-Pilot. Tell me what kind of email you'd like to create, and I'll help you craft something great." }] }]);
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
      const res = await axios.get('http://localhost:5001/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.companyName) setCompanyName(res.data.companyName);
      if (res.data.companyIndustry) setCompanyIndustry(res.data.companyIndustry);
      if (res.data.brandTone) setBrandTone(res.data.brandTone);
    } catch(err) {}
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/templates', { headers: { Authorization: `Bearer ${token}` } });
      setSavedTemplates(res.data);
    } catch (err) {}
  };

  const saveProfile = async () => {
    try {
      await axios.put('http://localhost:5001/api/auth/profile', { companyName, companyIndustry, brandTone }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Company context saved!");
      setShowSettings(false);
    } catch (err) { toast.error("Failed to save."); }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const userMsg = { role: "user", parts: [{ text: inputVal }] };
    const chatHistory = [...messages.slice(1)];
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsGenerating(true);
    try {
      const res = await axios.post('http://localhost:5001/api/ai/chat', { message: userMsg.parts[0].text, history: chatHistory }, { headers: { Authorization: `Bearer ${token}` } });
      const aiResponseText = res.data.parts[0].text;
      try {
        const cleanJson = aiResponseText.replace(/```json/g, "").replace(/```html/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (parsed.subject && parsed.content) {
          setSubject(parsed.subject);
          setContent(parsed.content);
          setMessages(prev => [...prev, { role: "model", parts: [{ text: "✅ Done! I've populated the email in the editor. Check the preview on the right." }] }]);
          toast.success("Email drafted!");
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        setMessages(prev => [...prev, { role: "model", parts: [{ text: aiResponseText }] }]);
      }
    } catch (err) { toast.error("AI request failed."); }
    finally { setIsGenerating(false); }
  };

  const handleSaveWorkspace = async () => {
    if (!content) return toast.error("Nothing to save!");
    try {
      await axios.post('http://localhost:5001/api/templates', { name: templateName || "AI Generated Template", subject, htmlContent: content }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Template saved!");
      setTemplateName('');
      fetchTemplates();
    } catch(err) { toast.error("Save failed."); }
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={22} color="var(--accent)" /> AI Co-Pilot Studio</h1>
          <p>Chat with AI to brainstorm and generate email templates.</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Settings size={14} /> Brand Profile
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid var(--primary)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Company Context</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.8rem' }}>The AI will auto-use this info in every conversation.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" />
            <input type="text" placeholder="Industry" value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} className="input-field" />
            <input type="text" placeholder="Brand Tone" value={brandTone} onChange={e => setBrandTone(e.target.value)} className="input-field" />
          </div>
          <button onClick={saveProfile} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.8rem' }}>Save</button>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1rem', minHeight: 0 }}>
        {/* Left: Chat + Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' }}>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot color="var(--accent)" size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Assistant</span>
            </div>
            {/* Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', gap: '6px' }}>
                  {m.role === 'model' && <Bot size={14} color="var(--accent)" style={{ marginTop: '4px', flexShrink: 0 }} />}
                  <div className={m.role === 'model' ? 'markdown-body' : ''} style={{
                    background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-elevated)',
                    padding: '10px 14px', borderRadius: '12px',
                    borderTopRightRadius: m.role === 'user' ? '2px' : '12px',
                    borderTopLeftRadius: m.role === 'model' ? '2px' : '12px',
                    fontSize: '0.85rem', lineHeight: '1.5',
                  }}>
                    {m.role === 'model' ? <ReactMarkdown>{m.parts[0].text}</ReactMarkdown> : m.parts[0].text}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <div className="animate-pulse">●</div> Thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            {/* Input */}
            <form onSubmit={handleSendChat} style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <input
                type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                placeholder="Describe your email idea..."
                className="input-field" style={{ borderRadius: '20px', padding: '10px 16px', flex: 1 }}
              />
              <button type="submit" disabled={isGenerating} style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'var(--accent)', border: 'none', color: 'white',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'opacity 0.2s', opacity: isGenerating ? 0.5 : 1,
              }}>
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* Saved Gallery */}
          <div className="glass-panel" style={{ padding: '1rem 1.25rem', maxHeight: '180px', overflowY: 'auto' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Saved Templates</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {savedTemplates.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No templates saved yet.</p>}
              {savedTemplates.map(t => (
                <div key={t._id} onClick={() => { setSubject(t.subject); setContent(t.htmlContent); setTemplateName(t.name); }}
                  style={{ padding: '8px 10px', background: 'var(--bg-input)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', transition: 'background 0.15s' }}>
                  {t.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Editor + Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600 }}>
                <FileText size={16} color="var(--primary)" /> Editor
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Template name" value={templateName} onChange={e => setTemplateName(e.target.value)} className="input-field" style={{ width: '160px', padding: '6px 10px', fontSize: '0.8rem' }} />
                <button onClick={handleSaveWorkspace} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.8rem', color: 'var(--success)', borderColor: 'rgba(52,211,153,0.3)' }}>
                  <Save size={13} /> Save
                </button>
              </div>
            </div>
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' }}>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" style={{ marginBottom: '1rem' }} />
            <label style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block' }}>HTML Source</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input-field" style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.5' }} />
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>Live Preview</h3>
            <div style={{ background: 'white', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe
                srcDoc={content || "<div style='padding:24px;color:#aaa;font-family:sans-serif;text-align:center;'>Email preview will appear here</div>"}
                style={{ width: '100%', height: '350px', border: 'none', display: 'block' }}
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;
