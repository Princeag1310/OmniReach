import API_BASE from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, User, Tag, UploadCloud, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Contacts = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({ email: '', firstName: '', lastName: '' });
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await axios.get(API_BASE + '/api/contacts', { headers: { Authorization: `Bearer ${token}` } });
      setContacts(res.data);
    } catch (err) { toast.error('Failed to load contacts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchContacts(); }, [token]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE + '/api/contacts', newContact, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Contact added');
      setShowModal(false);
      setNewContact({ email: '', firstName: '', lastName: '' });
      fetchContacts();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleBulkUpload = async () => {
    if (!fileInput) return toast.error("Select a CSV file");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("csvFile", fileInput);
    try {
      const res = await axios.post(API_BASE + '/api/contacts/bulk', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      toast.success(res.data.message);
      setFileInput(null);
      fetchContacts();
    } catch(err) { toast.error("CSV upload failed."); }
    finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete contact "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/api/contacts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Contact deleted');
      fetchContacts();
    } catch (err) { toast.error('Delete failed'); }
  };

  const filtered = contacts.filter(c =>
    (c.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Contacts</h1>
          <p>Manage your audience and subscriber list.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <UploadCloud size={13} />
            <span>{fileInput ? fileInput.name.slice(0, 15) : 'Choose CSV'}</span>
            <input type="file" accept=".csv" onChange={(e) => setFileInput(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </label>
          {fileInput && (
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={handleBulkUpload} disabled={isUploading}>
              {isUploading ? '...' : 'Upload'}
            </button>
          )}
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', fontSize: '0.8rem' }} onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '280px' }}>
        <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field" style={{ paddingLeft: '30px', fontSize: '0.8rem' }} />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tags</th>
                <th style={{ width: '90px' }}>Status</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No contacts found.</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                          <User size={12} />
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{c.firstName || 'Unknown'} {c.lastName || ''}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.email}</td>
                    <td>
                      {c.tags?.length > 0 ? c.tags.map((t: string) => (
                        <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 6px', background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.7rem', marginRight: '3px' }}>
                          <Tag size={8} />{t}
                        </span>
                      )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                    </td>
                    <td>
                      <span className={c.unsubscribed ? 'badge badge-warning' : 'badge badge-success'}>
                        {c.unsubscribed ? 'Unsub' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDelete(c._id, c.firstName || c.email)} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade" style={{ background: 'var(--bg-surface)', padding: '1.75rem', width: '100%', maxWidth: '380px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Add Contact</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input type="text" placeholder="First Name" value={newContact.firstName} onChange={(e) => setNewContact({...newContact, firstName: e.target.value})} className="input-field" />
              <input type="text" placeholder="Last Name" value={newContact.lastName} onChange={(e) => setNewContact({...newContact, lastName: e.target.value})} className="input-field" />
              <input type="email" placeholder="Email" required value={newContact.email} onChange={(e) => setNewContact({...newContact, email: e.target.value})} className="input-field" />
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
