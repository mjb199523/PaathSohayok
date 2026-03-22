import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, UserPlus, Trash2, Edit2, ShieldAlert, Users, Mail, Lock, User, CheckCircle2, LayoutDashboard, Settings, HelpCircle, X, Search, ChevronRight, FileText, DownloadCloud, Loader2, Library } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('users'); 
  const [users, setUsers] = useState([]);
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'teacher' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [creationsPage, setCreationsPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const ITEMS_PER_PAGE = 10;
  const [stats, setStats] = useState({ total_creations: 0, pdf_downloads: 0 });
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    setUsersPage(1);
    setCreationsPage(1);
    setSearchTerm('');
    fetchUsers();
    fetchCreations();
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    const tabName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    document.title = `${tabName} - Admin Dashboard | PaathSohayok`;
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/creations/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setStats(response.data);
    } catch (err) { console.warn("Failed stats"); }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setUsers(response.data);
    } catch (err) { } finally { setLoading(false); }
  };

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/creations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setCreations(response.data);
    } catch (err) { } finally { setLoading(false); }
  };

  const deleteCreation = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/creations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setCreations(prev => prev.filter(c => c.id !== id));
    } catch (err) { alert('Failed to delete creation globally'); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        await axios.put(`${API_URL}/api/admin/users/${editingUserId}`, newUser, {
          headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
      } else {
        await axios.post(`${API_URL}/api/admin/users`, newUser, {
          headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
      }
      setShowAddForm(false);
      fetchUsers();
    } catch (err) { setError('Failed to manage user'); }
  };

  const handlePrint = (overrideData = null) => {
    const data = overrideData || printData;
    if (!data) return;
    window.print();
  };

  const handleDownloadGlobal = async (item) => {
    try {
      setDownloadingId(item.id);
      const response = await axios.get(`${API_URL}/api/admin/creations/${item.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setPrintData(response.data);
      setTimeout(() => {
        handlePrint(response.data);
        setPrintData(null);
      }, 500);
    } catch (err) { alert("Download failed"); } finally { setDownloadingId(null); }
  };

  const filteredCreations = creations.filter(c => 
      c.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalCreationsPages = Math.ceil(filteredCreations.length / ITEMS_PER_PAGE);
  const paginatedCreations = filteredCreations.slice((creationsPage - 1) * ITEMS_PER_PAGE, creationsPage * ITEMS_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-9 h-9 bg-pm-green rounded-lg flex items-center justify-center text-white"><Library className="w-5 h-5 flex-shrink-0" /></div>
            <div className="flex flex-col"><span className="font-bold text-lg">PaathSohayok</span></div>
        </div>
        <nav className="p-4 space-y-1 mt-4">
            <button onClick={() => setActiveTab('users')} className={`pm-sidebar-item w-full ${activeTab === 'users' ? 'active' : ''}`}><Users className="w-4 h-4" />Manage Users</button>
            <button onClick={() => setActiveTab('creations')} className={`pm-sidebar-item w-full ${activeTab === 'creations' ? 'active' : ''}`}><FileText className="w-4 h-4" />All Generated Files</button>
            <button onClick={() => setActiveTab('settings')} className={`pm-sidebar-item w-full ${activeTab === 'settings' ? 'active' : ''}`}><Settings className="w-4 h-4" />System Settings</button>
        </nav>
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-gray-50/50">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all rounded-lg"><LogOut className="w-4 h-4" />Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
            {activeTab === 'users' && (<h2 className="text-3xl font-bold mb-10">Admin Dashboard</h2>)}
            {activeTab === 'creations' && (
                <div className="pm-card shadow-sm border-gray-100 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F9FAFB] text-gray-500 text-[11px] uppercase tracking-widest font-bold">
                                <tr><th className="px-6 py-4">File</th><th className="px-6 py-4">Educator</th><th className="px-6 py-4">Context</th><th className="px-6 py-4">Created</th><th className="px-6 py-4 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedCreations.map((c, idx) => (
                                    <tr key={c.id} className="hover:bg-green-50/30 transition-colors group">
                                        <td className="px-6 py-4"><p className="font-bold text-gray-900 text-sm">{c.file_name}</p><p className="text-[10px] text-pm-green uppercase font-bold">{c.topic}</p></td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{c.profiles?.name}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-600">Grade {c.class} • {c.subject}</td>
                                        <td className="px-6 py-4 text-[11px] text-gray-400 font-bold">{new Date(c.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button disabled={downloadingId === c.id} onClick={() => handleDownloadGlobal(c)} className="p-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-all">
                                                {downloadingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => deleteCreation(c.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </main>

      <div className="hidden print:block fixed inset-0 z-[9999] bg-white text-gray-900 p-12 overflow-visible">
          {printData && (
              <div className="max-w-4xl mx-auto">
                  <div className="border-b-4 border-pm-green pb-10 mb-12 text-center">
                       <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">{printData.subject}</h1>
                       <p className="text-xl font-bold text-pm-green uppercase tracking-widest leading-none">Topic: {printData.topic}</p>
                       <p className="mt-4 text-gray-400 font-bold">Standard {printData.class} • {printData.language} Medium</p>
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: printData.content.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>') }}></div>
              </div>
          )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:block, .print\\:block * { visibility: visible; }
          .print\\:block { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;
