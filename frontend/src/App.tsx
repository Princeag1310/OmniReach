import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Templates from './pages/Templates';
import Campaigns from './pages/Campaigns';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/auth" element={<Auth />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/campaigns" element={<Campaigns />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
