import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, User, Tag, UploadCloud, Search } from 'lucide-react';
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

  const filtered = contacts.filter(c =>
    (c.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Contacts</h1>
          <p>Manage your audience and subscriber list.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
            <input type="file" accept=".csv" onChange={(e) => setFileInput(e.target.files?.[0] || null)} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '140px', border: 'none', background: 'transparent', outline: 'none' }} />
            <button className="btn-primary" style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleBulkUpload} disabled={isUploading || !fileInput}>
              <UploadCloud size={12}/> {isUploading ? '...' : 'Import'}
            </button>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }} onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '320px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text" placeholder="Search contacts..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="input-field" style={{ paddingLeft: '34px' }}
        />
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Tags</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No contacts found.</td></tr>
            ) : (
              filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        <User size={14} />
                      </div>
                      <span style={{ fontWeight: 500 }}>{c.firstName || 'Unknown'} {c.lastName || ''}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.email}</td>
                  <td>
                    {c.tags?.length > 0 ? c.tags.map((t: string) => (
                      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: 'rgba(124,58,237,0.1)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem', marginRight: '4px', border: '1px solid rgba(124,58,237,0.2)' }}>
                        <Tag size={10} />{t}
                      </span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>}
                  </td>
                  <td>
                    <span className={c.unsubscribed ? 'badge badge-warning' : 'badge badge-success'}>
                      {c.unsubscribed ? 'Unsubscribed' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel animate-fade" style={{ background: 'var(--bg-surface)', padding: '2rem', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem' }}>Add Contact</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" placeholder="First Name" value={newContact.firstName} onChange={(e) => setNewContact({...newContact, firstName: e.target.value})} className="input-field" />
              <input type="text" placeholder="Last Name" value={newContact.lastName} onChange={(e) => setNewContact({...newContact, lastName: e.target.value})} className="input-field" />
              <input type="email" placeholder="Email Address" required value={newContact.email} onChange={(e) => setNewContact({...newContact, email: e.target.value})} className="input-field" />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
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
