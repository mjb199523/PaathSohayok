import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, UserPlus, Trash2, Edit2, ShieldAlert, Users, Mail, Lock, User, CheckCircle2, LayoutDashboard, Settings, HelpCircle, X, Search, ChevronRight, FileText, DownloadCloud, Loader2, Library, Sparkles, BookOpen, ClipboardList, PenTool, CheckSquare, Download } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'creations', 'settings'
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
  const ITEMS_PER_PAGE = 10;
  const [stats, setStats] = useState({ total_creations: 0, pdf_downloads: 0 });
  const [printData, setPrintData] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    setUsersPage(1);
    setCreationsPage(1);
    setSearchTerm('');
    fetchUsers();
    fetchCreations();
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    setUsersPage(1);
    setCreationsPage(1);
  }, [searchTerm]);

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
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/creations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setCreations(response.data);
    } catch (err) {
      console.error('Failed to fetch global creations');
    } finally {
      setLoading(false);
    }
  };

  const deleteCreation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file? This will remove it for both Admin and Teacher permanently.')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/creations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      // Instant update
      setCreations(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete creation globally');
    }
  };

  const renderDocumentSections = (resultStr, language, forPrint = false) => {
      if (typeof resultStr !== 'string') return null;
      const sections = resultStr.split(/(?=Lesson Plan|Classroom Activities|Homework|Assessment Questions|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন|INFORMATION|তথ্য)/i).filter(s => s.trim().length > 5);

      return sections.map((section, idx) => {
          const rawTitleMatch = section.match(/^(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|গৃহকাৰ্য|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i);
          const rawParsedTitle = rawTitleMatch ? rawTitleMatch[1] : (idx === 0 ? "Information Detail" : `Part ${idx + 1}`);

          const tl = rawParsedTitle.toLowerCase();
          let category = 'general';
          if (tl.includes('lesson') || tl.includes('পাঠ')) category = 'lesson';
          else if (tl.includes('activ') || tl.includes('শ্ৰেণ')) category = 'activity';
          else if (tl.includes('home') || tl.includes('গৃহ')) category = 'homework';
          else if (tl.includes('assess') || tl.includes('মূল্যা')) category = 'assessment';

          let finalTitle = rawParsedTitle;
          if (language === 'Assamese') {
              if (category === 'general') finalTitle = 'Information (তথ্য)';
              else if (category === 'lesson') finalTitle = 'Lesson Plan (পাঠ পৰিকল্পনা)';
              else if (category === 'activity') finalTitle = 'Classroom Activities (শ্ৰেণীকক্ষৰ কাৰ্যসূচী)';
              else if (category === 'homework') finalTitle = 'Homework (গৃহকাৰ্য)';
              else if (category === 'assessment') finalTitle = 'Assessment Questions (মূল্যায়নৰ প্ৰশ্ন)';
          } else {
              if (category === 'general') finalTitle = 'Information Detail';
              else if (category === 'lesson') finalTitle = 'Lesson Plan';
              else if (category === 'activity') finalTitle = 'Classroom Activities';
              else if (category === 'homework') finalTitle = 'Homework';
              else if (category === 'assessment') finalTitle = 'Assessment Questions';
          }

          let body = section.replace(/^(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|গৃহকাৰ্য|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i, '');
          body = body.replace(/---/g, '').replace(/\*/g, '').replace(/\.\./g, '').trim().replace(/^[\s:)*-]+/, '').replace(/[\s:(*-]+$/, '').trim();
          if (!body && idx > 0) return null;

          const iconMap = {
              'general': <Sparkles className="w-5 h-5" />,
              'lesson': <BookOpen className="w-5 h-5" />,
              'activity': <ClipboardList className="w-5 h-5" />,
              'homework': <PenTool className="w-5 h-5" />,
              'assessment': <CheckSquare className="w-5 h-5" />
          };

          return (
              <div key={idx} className="group page-break-inside-avoid">
                  <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-pm-green border border-green-100">
                          {iconMap[category] || <Sparkles className="w-4 h-4" />}
                      </div>
                      <h3 className="text-xl font-bold font-heading text-gray-900 border-b-2 border-pm-green/10 pb-1">{finalTitle}</h3>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50/30 p-6 rounded-2xl border border-gray-100 font-medium mb-8">
                      {body}
                  </div>
              </div>
          );
      }).filter(Boolean);
  };

  const handlePrint = (item) => {
    const originalTitle = document.title;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;
    
    const cleanSubject = (item.subject || 'material').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanClass = (item.class || '0').toString().replace(/[^a-z0-9]/g, '_');
    
    document.title = `${dateStr}_class_${cleanClass}_${cleanSubject}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadGlobal = async (item) => {
      try {
          setDownloadingId(item.id);
          const response = await axios.get(`${API_URL}/api/creations/get/${item.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
          });
          setPrintData(response.data);
          setTimeout(() => {
              handlePrint(response.data);
              setPrintData(null);
          }, 500);
      } catch (err) {
          alert("Failed to retrieve archived content.");
      } finally {
          setDownloadingId(null);
      }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (editingUserId) {
        await axios.put(`${API_URL}/api/admin/users/${editingUserId}`, newUser, {
          headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
        setSuccess('User updated successfully!');
      } else {
        await axios.post(`${API_URL}/api/admin/users`, newUser, {
          headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
        setSuccess('User created successfully!');
      }
      setNewUser({ name: '', email: '', password: '', role: 'teacher' });
      setShowAddForm(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${editingUserId ? 'update' : 'create'} user`);
    }
  };

  const openEditModal = (user) => {
    setNewUser({ name: user.name || '', email: user.email, password: '', role: user.role || 'teacher' });
    setEditingUserId(user.id);
    setShowAddForm(true);
  };


  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalUsersPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((usersPage - 1) * ITEMS_PER_PAGE, usersPage * ITEMS_PER_PAGE);

  const filteredCreations = creations.filter(c => 
      c.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalCreationsPages = Math.ceil(filteredCreations.length / ITEMS_PER_PAGE);
  const paginatedCreations = filteredCreations.slice((creationsPage - 1) * ITEMS_PER_PAGE, creationsPage * ITEMS_PER_PAGE);

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter text-gray-900">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-9 h-9 bg-pm-green rounded-lg flex items-center justify-center text-white shadow-sm">
                <Library className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg font-heading text-gray-900 leading-none">PaathSohayok</span>
                <span className="text-[10px] block -mt-1 font-semibold text-pm-green tracking-widest uppercase">{"\u09AA\u09BE\u09A0\u09B8\u09B9\u09BE\u09DF\u0995"}</span>
            </div>
        </div>

        <nav className="p-4 space-y-1 mt-4">
            <button 
                onClick={() => setActiveTab('users')}
                className={`pm-sidebar-item w-full ${activeTab === 'users' ? 'active' : ''}`}
            >
                <Users className="w-4 h-4" />Manage Users
            </button>
            <button 
                onClick={() => setActiveTab('creations')}
                 className={`pm-sidebar-item w-full ${activeTab === 'creations' ? 'active' : ''}`}
            >
                <FileText className="w-4 h-4" />All Generated Files
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`pm-sidebar-item w-full ${activeTab === 'settings' ? 'active' : ''}`}
            >
                <Settings className="w-4 h-4" />System Settings
            </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-pm-green/10 text-pm-green flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.name || 'System Admin'}</p>
                    <p className="text-[10px] text-gray-400 font-semibold truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all rounded-lg"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col items-center">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">PaathSohayok Dev</p>
                <p className="text-[11px] font-bold text-pm-green/40 mt-1">Manashjyoti Barman</p>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
            {activeTab === 'users' && (
                <>
                    <header className="flex justify-between items-center mb-10">
                        <div>
                           <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight tracking-tight">User Management</h2>
                           <p className="text-gray-500 text-sm mt-1">Manage school accounts and access credentials.</p>
                        </div>
                        <button 
                            onClick={() => {
                                setEditingUserId(null);
                                setNewUser({ name: '', email: '', password: '', role: 'teacher' });
                                setShowAddForm(true);
                            }}
                            className="pm-button-primary flex items-center gap-2 px-6 shadow-md shadow-green-900/10"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="text-base font-bold">Add Teacher Account</span>
                        </button>
                    </header>

                            {/* Admin Stats Analytics Grid - 5 Rows */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                                <StatsCard title="Total Teachers" value={users.length} icon={<Users className="text-blue-600" />} />
                                <StatsCard title="Active Logins" value={users.length} icon={<CheckCircle2 className="text-green-600" />} />
                                <StatsCard title="Generated Content" value={creations.length || stats.total_creations} icon={<FileText className="text-amber-500" />} />
                                <StatsCard title="PDF Downloads" value={stats.pdf_downloads} icon={<DownloadCloud className="text-indigo-600" />} />
                                <StatsCard title="Recent Growth" value="+2 this week" icon={<ChevronRight className="text-gray-400" />} />
                            </div>

                    {/* Table Container */}
                    <div className="pm-card shadow-sm border-gray-100 bg-white">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                            <h3 className="text-lg font-bold font-heading">Teaching Faculty</h3>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Search faculty..."
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pm-green/20 focus:border-pm-green outline-none transition-all w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F9FAFB] text-gray-500 text-[11px] uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-8 py-4">Status & Name</th>
                                        <th className="px-8 py-4">Internal Email</th>
                                        <th className="px-8 py-4">System Role</th>
                                        <th className="px-8 py-4 text-right pr-12">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 text-sm">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-pm-green mb-4" />
                                                <span className="font-semibold tracking-wide animate-pulse">Loading directory...</span>
                                            </div>
                                        </td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan="4" className="px-8 py-20 text-center text-gray-400 text-sm italic">No users found. Start by adding a teacher account.</td></tr>
                                    ) : (
                                        paginatedUsers.map((u, idx) => (
                                            <tr key={u.id} className={`${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'} hover:bg-green-50/30 transition-colors group cursor-default`}>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white shadow-sm ring-1 ring-green-100"></div>
                                                        <div>
                                                           <p className="font-bold text-gray-900 leading-tight">{u.name || 'Set Name'}</p>
                                                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Verified User</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-gray-600 font-medium text-sm">{u.email}</td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-tight ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-green-50 text-green-700'}`}>
                                                        {(u.role || 'teacher').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right space-x-2 pr-12 transition-opacity whitespace-pre-wrap">
                                                    <button onClick={() => openEditModal(u)} className="p-2.5 bg-white border border-gray-100 text-blue-600 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteUser(u.id)} className="p-2.5 bg-white border border-rose-100 text-rose-500 rounded-lg hover:border-rose-400 hover:shadow-sm transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {!loading && totalUsersPages > 1 && (
                                <div className="flex justify-between items-center px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                                    <span className="text-sm font-semibold text-gray-500">Page {usersPage} of {totalUsersPages}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={usersPage === 1}
                                            onClick={() => setUsersPage(p => p - 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <button 
                                            disabled={usersPage === totalUsersPages}
                                            onClick={() => setUsersPage(p => p + 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'creations' && (
                <>
                    <header className="mb-10">
                       <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight">All Generated Files</h2>
                       <p className="text-gray-500 text-sm mt-1">Supervise and manage all AI education resources created by teachers globally.</p>
                    </header>

                    {/* Creations Table */}
                    <div className="pm-card shadow-sm border-gray-100 bg-white">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                            <h3 className="text-lg font-bold font-heading">Global creation History</h3>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Filter by file or teacher..."
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pm-green/20 focus:border-pm-green outline-none transition-all w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#F9FAFB] text-gray-500 text-[11px] uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-6 py-4">File Details</th>
                                        <th className="px-6 py-4">Educator</th>
                                        <th className="px-6 py-4">Class/Subject</th>
                                        <th className="px-6 py-4">Created On</th>
                                        <th className="px-6 py-4 text-right pr-12">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 text-sm">
                                            <div className="flex flex-col items-center justify-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-pm-green mb-4" />
                                                <span className="font-semibold tracking-wide animate-pulse">Synchronizing global files...</span>
                                            </div>
                                        </td></tr>
                                    ) : filteredCreations.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 text-sm italic">No files found in system records.</td></tr>
                                    ) : (
                                        paginatedCreations.map((c, idx) => (
                                            <tr key={c.id} className={`${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'} hover:bg-green-50/30 transition-colors group`}>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{c.file_name || 'Untitled Generation'}</p>
                                                        <p className="text-[10px] text-pm-green font-bold uppercase mt-1 tracking-tight">{c.topic}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                       <p className="text-sm font-bold text-gray-800">{c.profiles?.name}</p>
                                                       <p className="text-[10px] text-gray-400 font-semibold">{c.profiles?.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-600">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] mr-1">CLASS {c.class}</span>
                                                    {c.subject}
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-gray-400 font-bold whitespace-pre-wrap uppercase">
                                                    {new Date(c.created_at).toLocaleDateString()} <br/>
                                                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </td>
                                                <td className="px-6 py-4 text-right pr-12 transition-opacity whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            onClick={() => handleDownloadGlobal(c)}
                                                            disabled={downloadingId === c.id}
                                                            className="p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100/50 disabled:opacity-50"
                                                            title="Download File PDF"
                                                        >
                                                            {downloadingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteCreation(c.id)}
                                                            className="p-2.5 text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100/50"
                                                            title="Delete Global Record"
                                                        >
                                                            <Trash2 className="w-5 h-5 flex-shrink-0" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {!loading && totalCreationsPages > 1 && (
                                <div className="flex justify-between items-center px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                                    <span className="text-sm font-semibold text-gray-500">Page {creationsPage} of {totalCreationsPages}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={creationsPage === 1}
                                            onClick={() => setCreationsPage(p => p - 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Previous
                                        </button>
                                        <button 
                                            disabled={creationsPage === totalCreationsPages}
                                            onClick={() => setCreationsPage(p => p + 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'settings' && (
                <div className="pm-card p-12 text-center bg-white shadow-soft">
                     <Settings className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                     <h3 className="text-2xl font-bold font-heading text-gray-800">System Settings</h3>
                     <p className="text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">Platform-wide configuration and security defaults are managed here by authorized administrators.</p>
                </div>
            )}
        </div>
      </main>

      {/* Modal Redesign */}
      <AnimatePresence>
        {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative border border-gray-100"
                >
                    <button onClick={() => { setShowAddForm(false); setEditingUserId(null); }} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-rose-600 transition-all">
                        <X className="w-5 h-5 flex-shrink-0" />
                    </button>
                    
                    <div className="mb-8 pr-12">
                        <h2 className="text-2xl font-bold font-heading mb-2">{editingUserId ? 'Edit Faculty' : 'Register New Faculty'}</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">{editingUserId ? 'Update the details for this accounts.' : 'Provide basic details to create a secure teacher login account. Passwords can be changed later.'}</p>
                    </div>
                    
                    <form onSubmit={handleAddUser} className="space-y-6">
                        <FormField label="Teacher Name" icon={<User className="text-gray-400" />} placeholder="Enter full name" value={newUser.name} onChange={(val) => setNewUser({...newUser, name: val})} />
                        <FormField label="Official Email" icon={<Mail className="text-gray-400" />} placeholder="teacher@school.edu" type="email" value={newUser.email} onChange={(val) => setNewUser({...newUser, email: val})} />
                        <FormField label={editingUserId ? "New Password (Optional)" : "Temporary Password"} icon={<Lock className="text-gray-400" />} placeholder="••••••••" type="password" value={newUser.password} onChange={(val) => setNewUser({...newUser, password: val})} />

                        <div className="pt-4">
                            <button className="pm-button-primary w-full py-3.5 flex items-center justify-center gap-3">
                                {editingUserId ? <Edit2 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                <span className="text-lg font-bold">{editingUserId ? 'Update Account' : 'Generate Account'}</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* Hidden Print Overlay */}
      {printData && (
          <div className="hidden print:block absolute top-0 left-0 w-full min-h-screen bg-white z-[99999] p-12">
              <div className="border-b-2 border-pm-green/30 pb-8 mb-10 overflow-hidden relative">
                  <div className="flex justify-between items-end relative z-10">
                      <div>
                          <h1 className="text-2xl font-black font-heading text-pm-green mb-1 uppercase tracking-tight">{printData.subject} - {printData.topic}</h1>
                          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-none">Standard {printData.class} • {printData.language} Medium</p>
                      </div>
                      <div className="text-right">
                          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">PaathSohayok AI</p>
                          <p className="text-[10px] text-gray-300 font-bold">{new Date().toLocaleDateString('en-IN')}</p>
                      </div>
                  </div>
              </div>

              <div className="space-y-12">
                  {renderDocumentSections(printData.content, printData.language, true)}
              </div>
          </div>
      )}
    </div>
  );
};

const StatsCard = ({ title, value, icon }) => (
    <div className="pm-card p-6 flex justify-between items-center group cursor-default transition-all hover:bg-green-50/10">
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
            <h4 className="text-3xl font-extrabold font-heading text-gray-900 leading-none">{value}</h4>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all font-bold">
            {icon}
        </div>
    </div>
);

const FormField = ({ label, icon, placeholder, type = "text", value, onChange }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2 leading-tight">{label}</label>
        <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 group-focus-within:text-pm-green transition-all">
                {icon}
            </div>
            <input 
                required
                type={type} 
                className="pm-input pl-11"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </div>
);

export default AdminDashboard;
