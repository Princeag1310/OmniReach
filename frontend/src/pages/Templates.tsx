import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bot, User as UserIcon, Save, FileText, Settings, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Templates = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<any[]>([{ role: "model", parts: [{ text: "Hi! I'm your AI Marketing Co-Pilot. What kind of email are we drafting today?" }] }]);
  const [inputVal, setInputVal] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);

  // Company Profile Context State
  const [showSettings, setShowSettings] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [brandTone, setBrandTone] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTemplates();
    fetchProfile();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        toast.success("Company context saved! AI will now implicitly remember this.");
        setShowSettings(false);
      } catch (err) {
        toast.error("Failed to save profile.");
      }
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { role: "user", parts: [{ text: inputVal }] };
    const chatHistory = [...messages.slice(1)]; // Skip the initial local greeting for the backend history
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsGenerating(true);

    try {
      const res = await axios.post('http://localhost:5001/api/ai/chat', { 
          message: userMsg.parts[0].text, 
          history: chatHistory 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const aiResponseText = res.data.parts[0].text;
      
      // Attempt to parse JSON to see if AI finalized the layout
      try {
          const cleanJson = aiResponseText.replace(/```json/g, "").replace(/```html/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          if (parsed.subject && parsed.content) {
             setSubject(parsed.subject);
             setContent(parsed.content);
             setMessages(prev => [...prev, { role: "model", parts: [{ text: "I have generated the final email layout! I populated it in the Preview Editor to the right." }] }]);
             toast.success("Email template successfully drafted!");
             setIsGenerating(false);
             return;
          }
      } catch (e) {
          // If JSON parse fails, it means the AI is just replying naturally in conversation!
          setMessages(prev => [...prev, { role: "model", parts: [{ text: aiResponseText }] }]);
      }
      
    } catch (err) {
      toast.error("Failed to reach AI Co-Pilot.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!content) return toast.error("Nothing to save!");
    try {
      await axios.post('http://localhost:5001/api/templates', { name: templateName || "AI Generated Template", subject, htmlContent: content }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Template saved successfully to your Directory!");
      setTemplateName('');
      fetchTemplates();
    } catch(err) {
      toast.error("Failed to save template.");
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Co-Pilot Studio</h1>
          <p style={{ color: 'var(--text-muted)' }}>Chat with your AI to brainstorm and dynamically generate beautiful responsive emails.</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
          <Settings size={18} /> Company Profile
        </button>
      </header>

      {/* Settings Modal Bar */}
      {showSettings && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid #6366f1' }}>
           <h3 style={{ marginBottom: '1rem' }}>Global Company Context</h3>
           <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Fill these out so the AI inherently understands your brand metrics during conversations.</p>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              <input type="text" placeholder="Industry (e.g., E-Commerce)" value={companyIndustry} onChange={e => setCompanyIndustry(e.target.value)} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              <input type="text" placeholder="Brand Tone (e.g., Playful & Urgent)" value={brandTone} onChange={e => setBrandTone(e.target.value)} style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
           </div>
           <button onClick={saveProfile} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Context</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Left Side: Conversational AI Window */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot color="#ec4899" size={24} />
                <h3 style={{ margin: 0 }}>AI Assistant</h3>
             </div>
             
             {/* Chat Messages */}
             <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((m, idx) => (
                   <div key={idx} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '8px' }}>
                      {m.role === 'model' && <div style={{ marginTop: '5px' }}><Bot size={16} color="#ec4899" /></div>}
                      <div style={{ 
                          background: m.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.1)', 
                          padding: '12px 16px', 
                          borderRadius: '12px',
                          borderTopRightRadius: m.role === 'user' ? '2px' : '12px',
                          borderTopLeftRadius: m.role === 'model' ? '2px' : '12px',
                          color: 'white',
                          fontSize: '0.95rem',
                          lineHeight: '1.4'
                      }}>
                          {m.parts[0].text}
                      </div>
                   </div>
                ))}
                {isGenerating && (
                    <div style={{ alignSelf: 'flex-start', padding: '12px', color: 'var(--text-muted)' }}>
                        AI is typing...
                    </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input Form */}
             <form onSubmit={handleSendChat} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={inputVal} 
                  onChange={e => setInputVal(e.target.value)} 
                  placeholder="Chat with AI..."
                  style={{ flex: 1, padding: '12px', borderRadius: '20px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                />
                <button type="submit" disabled={isGenerating} style={{ padding: '12px', borderRadius: '50%', background: '#ec4899', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Send size={18} />
                </button>
             </form>
           </div>

           {/* Saved Templates Minibar */}
           <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
              <h4 style={{ marginBottom: '10px' }}>Saved Gallery</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 {savedTemplates.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No templates saved yet.</p>}
                 {savedTemplates.map(t => (
                    <div key={t._id} onClick={() => { setSubject(t.subject); setContent(t.htmlContent); setTemplateName(t.name); }} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                       {t.name}
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Preview & Code Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileText size={20} color="#6366f1" /> Mail Editor</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Template Save Name" value={templateName} onChange={e => setTemplateName(e.target.value)} style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'white', outline: 'none' }} />
                <button onClick={handleSaveWorkspace} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.5)', padding: '8px 12px', borderRadius: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                   <Save size={16} /> Save
                </button>
              </div>
            </div>
          
            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Subject Line</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none', marginBottom: '1.5rem' }} />

            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>HTML Content Source</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} style={{ width: '100%', flex: 1, minHeight: '150px', padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'monospace' }} />
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Live Visual Preview</h3>
            <div style={{ background: 'white', borderRadius: '8px', minHeight: '400px', width: '100%', overflow: 'hidden', border: '1px solid #ccc' }}>
              <iframe 
                srcDoc={content || "<p style='color:#888; font-family: sans-serif; padding: 20px;'>Live email preview opens here once the AI finishes drafting!</p>"} 
                style={{ width: '100%', height: '400px', border: 'none' }}
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
