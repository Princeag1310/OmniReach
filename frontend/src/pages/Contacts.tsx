import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, User, Tag, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const Contacts = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '' });

  // Bulk Upload State
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch (err) {
      toast.error('Failed to load contacts');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/contacts', newContact, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Contact added');
      setShowModal(false);
      setNewContact({ email: '', firstName: '', lastName: '' });
      fetchContacts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add contact');
    }
  };

  const handleBulkUpload = async () => {
    if (!fileInput) return toast.error("Please select a CSV file");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("csvFile", fileInput);
    try {
      const res = await axios.post('http://localhost:5001/api/contacts/bulk', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      setFileInput(null);
      fetchContacts();
    } catch(err) {
      toast.error("Failed to process CSV file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Contacts Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your audience and tags efficiently.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '8px' }}>
            <input type="file" accept=".csv" onChange={(e) => setFileInput(e.target.files?.[0] || null)} style={{ fontSize: '0.8rem', width: '200px' }} />
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleBulkUpload} disabled={isUploading || !fileInput}>
              <UploadCloud size={14}/> {isUploading ? 'Uploading...' : 'Bulk Import'}
            </button>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>
            <Plus size={20} /> Add Contact
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: 'var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Tags</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
            ) : contacts.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No contacts found. Add your first one!</td></tr>
            ) : (
              contacts.map(c => (
                <tr key={c._id} style={{ borderBottom: 'var(--glass-border)' }}>
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'var(--card-bg)', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <User size={16} />
                    </div>
                    {c.firstName || 'Unknown'} {c.lastName}
                  </td>
                  <td style={{ padding: '1rem' }}>{c.email}</td>
                  <td style={{ padding: '1rem' }}>
                    {c.tags?.length > 0 ? c.tags.map((t: string) => <span key={t} style={{ padding: '4px 8px', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-color)', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px' }}><Tag size={12} style={{display:'inline', marginRight:'2px'}}/>{t}</span>) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                     <span style={{ color: c.unsubscribed ? '#f59e0b' : '#10b981', background: c.unsubscribed ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem' }}>
                        {c.unsubscribed ? 'Unsubscribed' : 'Active'}
                     </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade" style={{ background: '#1e293b', padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Contact</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="First Name" value={newContact.firstName} onChange={(e) => setNewContact({...newContact, firstName: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              <input type="text" placeholder="Last Name" value={newContact.lastName} onChange={(e) => setNewContact({...newContact, lastName: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              <input type="email" placeholder="Email Address" required value={newContact.email} onChange={(e) => setNewContact({...newContact, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: 'var(--glass-border)', color: 'white', borderRadius: '8px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
