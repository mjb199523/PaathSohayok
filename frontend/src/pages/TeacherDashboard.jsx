import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, BookOpen, Presentation, ClipboardList, PenTool, CheckSquare, GraduationCap, Copy, Download, RotateCcw, ChevronDown, CheckCircle, LayoutDashboard, Settings, HelpCircle, History, FileText, Loader2, Trash2, X, Cloud, Save, Timer, Lock } from 'lucide-react';
import axios from 'axios';

const TeacherDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'history', 'settings'
  const [history, setHistory] = useState([]);
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    topic: '',
    subTopic: '',
    language: 'English'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');
  const contentRef = useRef();

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiURL}/api/creations/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const saveCreation = async (manual = false) => {
    if (!result) return;
    if (!user || !user.id) {
        alert("Session error: Your educator ID is missing. Please Log Out and Log In again to sync your account.");
        return;
    }

    try {
      setSaving(true);
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiURL}/api/creations`, {
        userId: user.id,
        fileName: `${formData.subject}_${formData.topic}`,
        content: result,
        className: formData.className,
        subject: formData.subject,
        topic: formData.topic,
        subtopic: formData.subTopic,
        language: formData.language
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      if (manual) alert('Successfully saved to your Creation History!');
    } catch (err) {
      console.error('Failed to save:', err);
      const msg = err.response?.data?.error || 'Database sync failed. Please try again.';
      alert(`Save Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteFromHistory = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${apiURL}/api/creations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setHistory(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  const [lockExpiry, setLockExpiry] = useState(() => {
    const saved = localStorage.getItem('pm_lock_expiry');
    return saved ? parseInt(saved, 10) : null;
  });
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Real-time countdown engine & Persistance
  useEffect(() => {
    const timer = setInterval(() => {
        const now = Date.now();
        setCurrentTime(now);
        if (lockExpiry) {
            if (now > lockExpiry) {
                setLockExpiry(null);
                localStorage.removeItem('pm_lock_expiry');
            } else {
                localStorage.setItem('pm_lock_expiry', lockExpiry.toString());
            }
        }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockExpiry]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (loading || (lockExpiry && Date.now() < lockExpiry)) return;
    
    setLoading(true);
    setResult(null);
    try {
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiURL}/api/generate`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setResult(response.data.content);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Generation failed. Please try again.';
      alert(errorMsg);
      
      // If rate limited, lock the button
      if (err.response?.status === 429) {
          const waitVal = err.response?.data?.retryAfter || 60;
          setLockExpiry(Date.now() + (waitVal * 1000)); 
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleLogOut = () => {
    onLogout();
    navigate('/login');
  };

  const handlePrint = () => {
    // Track download event
    const trackDownload = async () => {
      try {
        const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await axios.post(`${apiURL}/api/creations/track-download`, null, {
            headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
      } catch (err) { console.warn("Track sync failed"); }
    };
    trackDownload();

    const originalTitle = document.title;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;
    const cleanSubject = (formData.subject || 'material').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanClass = (formData.className || '0').toString().replace(/[^a-z0-9]/g, '_');
    
    document.title = `${dateStr}_class_${cleanClass}_${cleanSubject}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 overflow-y-auto no-print">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-pm-green rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/10">
                <GraduationCap className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg font-heading text-gray-900 leading-none">PaathSohayok</span>
                <span className="text-[10px] font-extrabold text-pm-green tracking-[0.2em] uppercase mt-1">পাঠসহায়ক</span>
            </div>
        </div>

        <nav className="p-4 space-y-1 mt-4">
            <button 
                onClick={() => setActiveTab('generate')}
                className={`pm-sidebar-item w-full ${activeTab === 'generate' ? 'active' : ''}`}
            >
                <Sparkles className="w-4 h-4" />Generate AI Content
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pm-sidebar-item w-full ${activeTab === 'history' ? 'active' : ''}`}
            >
                <History className="w-4 h-4" />Creation History
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`pm-sidebar-item w-full ${activeTab === 'settings' ? 'active' : ''}`}
            >
                <Settings className="w-4 h-4" />App Settings
            </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-pm-green/10 text-pm-green flex items-center justify-center font-bold text-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{user.name || 'Academic Educator'}</p>
                    <p className="text-[10px] text-gray-400 font-semibold truncate">{user.email}</p>
                </div>
            </div>
            <button 
                onClick={handleLogOut}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-all"
            >
                <LogOut className="w-4 h-4" />
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 print:ml-0 print:p-0">
        <div className="max-w-5xl mx-auto pb-20">
            {activeTab === 'generate' && (
                <>
                <header className="mb-10 no-print">
                    <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight flex items-center gap-3">
                        Content Studio
                        <span className="text-xs bg-green-50 text-pm-green px-2 py-0.5 rounded border border-green-100 font-bold tracking-widest uppercase">BETA</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Design high-quality lesson materials with artificial intelligence assistance.</p>
                </header>

                <div className="pm-card p-10 shadow-sm border-gray-100 bg-white mb-10 no-print">
                    <h3 className="text-lg font-bold font-heading mb-8 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-pm-green" />
                        Material Configuration
                    </h3>
                    
                    <form onSubmit={handleGenerate} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <InputGroup label="Target Class" desc="Select student level">
                                <div className="relative">
                                    <select 
                                        className="pm-input appearance-none bg-gray-50/30 pl-4 py-3"
                                        value={formData.className}
                                        onChange={(e) => setFormData({...formData, className: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Grade</option>
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i+1} value={i+1}>Grade {i+1} (Class {i+1})</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </InputGroup>

                            <InputGroup label="Subject Division" desc="Core academic subject">
                                <input 
                                    type="text"
                                    className="pm-input bg-gray-50/30 py-3"
                                    placeholder="e.g. Political Science"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    required
                                />
                            </InputGroup>

                            <InputGroup label="Primary Topic" desc="The main chapter or concept">
                                <input 
                                    type="text"
                                    className="pm-input bg-gray-50/30 py-3"
                                    placeholder="e.g. Fundamental Rights"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                    required
                                />
                            </InputGroup>

                            <InputGroup label="Sub-Topic Detail" desc="Specific segment within the topic">
                                <input 
                                    type="text"
                                    className="pm-input bg-gray-50/30 py-3"
                                    placeholder="e.g. Right to Speech"
                                    value={formData.subTopic}
                                    onChange={(e) => setFormData({...formData, subTopic: e.target.value})}
                                    required
                                />
                            </InputGroup>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-12">
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                                {['English', 'Assamese'].map((lang) => (
                                    <button 
                                        key={lang}
                                        type="button"
                                        onClick={() => setFormData({...formData, language: lang})}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.language === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

                                <button 
                                    type="submit"
                                    disabled={loading || (lockExpiry && currentTime < lockExpiry)}
                                    className={`pm-button-primary px-10 py-5 flex flex-col items-center justify-center transition-all group shadow-2xl relative overflow-hidden transition-standard ${lockExpiry ? 'bg-gray-400 cursor-not-allowed border-gray-100' : 'bg-pm-green border-pm-green hover:bg-green-700 active:scale-95'}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                           <Loader2 className="w-6 h-6 animate-spin text-white" />
                                           <span className="text-xl font-black text-white uppercase tracking-widest">Synthesizing...</span>
                                        </div>
                                    ) : lockExpiry && currentTime < lockExpiry ? (
                                        <div className="flex flex-col items-center leading-none text-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Timer className="w-5 h-5 text-white/90 animate-pulse" />
                                                <span className="text-xl font-black text-white uppercase tracking-tight">AI Recovering...</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[14px] font-black text-white tracking-widest">
                                                    READY AT {new Date(lockExpiry).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </div>
                                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">
                                                    Wait {Math.ceil((lockExpiry - currentTime) / 1000)}s
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <Sparkles className="w-6 h-6 flex-shrink-0 text-white group-hover:rotate-12 transition-transform" />
                                            <span className="text-xl font-black text-white uppercase tracking-widest">Compose Material</span>
                                        </div>
                                    )}
                                </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-12">
                    {loading ? (
                         <div className="h-[400px] flex flex-col items-center justify-center text-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                className="mb-6 p-4 bg-green-50 rounded-full border border-green-100"
                            >
                                <Sparkles className="w-10 h-10 text-pm-green" />
                            </motion.div>
                            <h4 className="text-xl font-bold font-heading text-gray-900">Drafting Educational Content</h4>
                            <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Our educator AI is compiling your resources across multiple categories.</p>
                         </div>
                    ) : result ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Resource Header Panel */}
                            <div className="flex justify-between items-center mb-6 pt-4 border-b border-gray-100 pb-6 no-print">
                                <h3 className="text-xl font-bold font-heading text-gray-900">Educator's Resource Panel</h3>
                                <div className="flex gap-4">
                                    <button 
                                         onClick={() => handleCopy(result, 'all')}
                                         className="pm-button-secondary py-2 flex items-center gap-2 group hover:border-pm-green/30"
                                    >
                                        {copied === 'all' ? <CheckCircle className="w-4 h-4 text-pm-green" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-pm-green transition-colors" />}
                                        <span className="text-sm font-bold">Copy Full Content</span>
                                    </button>
                                    <button 
                                        disabled={saving}
                                        onClick={() => saveCreation(true)}
                                        className="pm-button-secondary py-2 flex items-center gap-2 bg-pm-green/5 text-pm-green border-pm-green/20 hover:bg-pm-green hover:text-white transition-all shadow-sm"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span className="text-sm font-bold">{saving ? 'Syncing...' : 'Save Draft'}</span>
                                    </button>
                                    <button 
                                         onClick={handlePrint}
                                         className="pm-button-primary bg-indigo-600 hover:bg-indigo-700 py-2 flex items-center gap-2 shadow-lg shadow-indigo-900/10"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="text-sm font-bold text-white">Download PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Document Body */}
                            <div ref={contentRef} className="pm-card p-12 bg-white shadow-xl ring-1 ring-gray-100 print:shadow-none print:ring-0 transition-standard hover:shadow-2xl">
                                <div className="border-b-2 border-pm-green/30 pb-8 mb-10 overflow-hidden relative">
                                    <div className="flex justify-between items-end relative z-10">
                                        <div>
                                            <h1 className="text-2xl font-black font-heading text-pm-green mb-1 uppercase tracking-tight">{formData.subject} - {formData.topic}</h1>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-none">Standard {formData.className} • {formData.language} Medium</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">PaathSohayok AI</p>
                                            <p className="text-[10px] text-gray-300 font-bold">{new Date().toLocaleDateString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-pm-green/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                </div>

                                <div className="space-y-16">
                                    {(() => {
                                        if (typeof result !== 'string') return null;
                                        const sections = result.split(/(?=Lesson Plan|Classroom Activities|Homework|Assessment Questions|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন)/i).filter(s => s.trim().length > 5);
                                        
                                        return sections.map((section, idx) => {
                                            const titleMatch = section.match(/^(Lesson Plan|Classroom Activities|Homework|Assessment Questions|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i);
                                            const title = titleMatch ? titleMatch[1] : (idx === 0 ? "General Content" : `Part ${idx + 1}`);
                                            let body = section.replace(/^(Lesson Plan|Classroom Activities|Homework|Assessment Questions|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i, '');

                                            body = body.replace(/---/g, '').replace(/\*/g, '').replace(/\.\./g, '').trim().replace(/^[\s:)*-]+/, '').replace(/[\s:(*-]+$/, '').trim();
                                            if (!body && idx > 0) return null;

                                            const iconMap = {
                                                "Lesson Plan": <BookOpen className="w-5 h-5" />, "পাঠ পৰিকল্পনা": <BookOpen className="w-5 h-5" />,
                                                "Classroom Activities": <ClipboardList className="w-5 h-5" />, "শ্ৰেণীৰ কাৰ্যকলাপ": <ClipboardList className="w-5 h-5" />,
                                                "Homework": <PenTool className="w-5 h-5" />, "ঘৰৰ কাম": <PenTool className="w-5 h-5" />,
                                                "Assessment Questions": <CheckSquare className="w-5 h-5" />, "মূল্যায়নৰ প্ৰশ্ন": <CheckSquare className="w-5 h-5" />
                                            };

                                            return (
                                                <div key={idx} className="group animate-in slide-in-from-bottom-4 duration-500 stagger-item" style={{ animationDelay: `${idx * 150}ms` }}>
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <div className="w-12 h-12 rounded-2xl bg-pm-green/10 flex items-center justify-center text-pm-green shadow-sm group-hover:bg-pm-green group-hover:text-white transition-all transform group-hover:scale-110">
                                                            {iconMap[title] || <Sparkles className="w-5 h-5" />}
                                                        </div>
                                                        <h3 className="text-2xl font-black font-heading text-gray-900 border-b-4 border-pm-green/10 pb-1">{title}</h3>
                                                    </div>
                                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-8 rounded-3xl border border-gray-100 font-medium leading-8 shadow-inner ring-1 ring-gray-100/50">
                                                        {body}
                                                    </div>
                                                </div>
                                            );
                                        }).filter(Boolean);
                                    })()}
                                </div>
                            </div>

                            <div className="text-center pt-16 no-print border-t border-gray-100">
                                <button 
                                    onClick={() => setResult(null)}
                                    className="text-gray-400 font-black hover:text-pm-green flex items-center gap-3 mx-auto transition-colors group"
                                >
                                    <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    <span className="text-sm uppercase tracking-widest">Start New Synthesis</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Idle State / Fallback */
                        <div className="h-[450px] flex flex-col items-center justify-center text-center p-12 pm-card border-dashed border-gray-200 bg-gray-50/30 rounded-[2.5rem] transition-all hover:bg-white hover:border-pm-green/20">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-green-900/5 mb-8 border border-gray-100 animate-bounce-slow">
                                <FileText className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black font-heading text-gray-400 leading-tight">Workspace Ready</h3>
                            <p className="text-gray-400 text-sm mt-4 max-w-sm font-medium leading-relaxed">
                                Please configure the lesson details in the form above and click "Compose Material" to generate high-quality assets.
                            </p>
                        </div>
                    )}
                </div>
                </>
            )}

            {activeTab === 'history' && (
                <div className="no-print">
                    <header className="mb-10">
                        <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight">Creation History</h2>
                        <p className="text-gray-500 text-sm mt-1">Review and manage your previously generated teaching materials.</p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full py-20 text-center text-gray-400 animate-pulse">Syncing your records...</div>
                        ) : history.length === 0 ? (
                            <div className="col-span-full py-20 text-center pm-card border-dashed border-gray-200">
                                <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-500">No History Yet</h3>
                                <p className="text-sm text-gray-400 mt-1">Your generated materials will appear here automatically.</p>
                            </div>
                        ) : history.map((item) => (
                            <div key={item.id} className="pm-card p-6 bg-white hover:border-pm-green/30 transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-pm-green">
                                        <FileText className="w-5 h-5 flex-shrink-0" />
                                    </div>
                                    <button 
                                        onClick={() => deleteFromHistory(item.id)}
                                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                                    </button>
                                </div>
                                <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{item.file_name}</h4>
                                <p className="text-[10px] font-bold text-pm-green uppercase tracking-widest mb-4">{item.topic}</p>
                                
                                <div className="space-y-2 mb-6 text-xs font-medium text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                        <span>Grade {item.class} • {item.subject}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                        <span className="uppercase tracking-tighter">
                                            {new Date(item.created_at).toLocaleDateString()} 
                                            <span className="mx-1.5 text-gray-300">•</span>
                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => {
                                        setFormData({
                                            className: item.class,
                                            subject: item.subject,
                                            topic: item.topic,
                                            subTopic: item.subtopic,
                                            language: item.language
                                        });
                                        setResult(item.content);
                                        setActiveTab('generate');
                                    }}
                                    className="w-full py-2.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-pm-green hover:text-white rounded-lg transition-all"
                                >
                                    Refactor / View Material
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="pm-card p-20 text-center bg-white border-gray-100 no-print">
                    <Settings className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold font-heading text-gray-800">Account Preferences</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">Customize your teaching defaults and security settings here. Features coming soon in next update.</p>
                </div>
            )}
        </div>
      </main>

      {/* Styles for print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .pm-card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 2rem !important; }
          .flex { display: block !important; }
          main { margin-left: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

const InputGroup = ({ label, desc, children }) => (
    <div className="space-y-3">
        <div>
            <label className="block text-sm font-bold text-gray-800 leading-tight">{label}</label>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1 tracking-tight">{desc}</p>
        </div>
        {children}
    </div>
);

export default TeacherDashboard;
