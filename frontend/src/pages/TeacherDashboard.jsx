import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, BookOpen, Presentation, ClipboardList, PenTool, CheckSquare, Library, Copy, Download, RotateCcw, ChevronDown, CheckCircle, LayoutDashboard, Settings, HelpCircle, History, FileText, Loader2, Trash2, X, Cloud, Save, Timer, Lock, Search } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const TeacherDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'history', 'settings'
  
  useEffect(() => {
    document.title = "Generate Learning Content in Minutes | PaathSohayok";
  }, []);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
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
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetTimer, setResetTimer] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [historyDownloadingId, setHistoryDownloadingId] = useState(null);
  const [profile, setProfile] = useState(null);
  const contentRef = useRef();

  useEffect(() => {
    setHistoryPage(1);
    setSearchTerm('');
    fetchProfile();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryPage(1);
      fetchHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    const tabName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    document.title = `${tabName} - Teacher Dashboard | PaathSohayok`;
  }, [activeTab]);

  useEffect(() => {
    if (!loading && result && !resetTimer && contentRef.current) {
        setTimeout(() => {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
  }, [loading, result, resetTimer]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile');
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/creations/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      // The content field is now empty in the list view, which is fine
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
      await axios.post(`${API_URL}/api/creations`, {
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
      if (manual) {
          setIsSaved(true);
          setResetTimer(true);
          
          // Wait 3 seconds with loader, then refresh
          setTimeout(() => {
              setResult(null); 
              setFormData({
                className: '',
                subject: '',
                topic: '',
                subTopic: '',
                language: 'English'
              });
              setIsSaved(false);
              setResetTimer(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 3000);
      }
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
      await axios.delete(`${API_URL}/api/creations/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setHistory(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  const filteredHistory = history.filter(item => 
      item.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalHistoryPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE);

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

  const renderDocumentSections = (resultStr, language, forPrint = false) => {
      if (typeof resultStr !== 'string') return null;
      
      const keywordPattern = "(?:LESSON PLAN|CLASSROOM ACTIVITIES|HOMEWORK|ASSESSMENT QUESTIONS|INFORMATION|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|শ্ৰেণীকক্ষৰ কাৰ্যসূচী|গৃহকাৰ্য|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)";
      // Only split on major headings that are at the start of a line and numbered
      const splitRegex = new RegExp(`(?=\\n\\s*\\d[.)]\\s*${keywordPattern})`, 'i');
      const sections = resultStr.split(splitRegex).filter(s => s.trim().length > 5);

      return sections.map((section, idx) => {
          // Robust heading identification with numbering support
          const headingMatch = section.match(/^(?:\s*(?:\d[.)]\s*)?)(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|শ্ৰেণীকক্ষৰ কাৰ্যসূচী|গৃহকাৰ্য|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i);
          const rawParsedTitle = headingMatch ? headingMatch[1].trim() : (idx === 0 ? "Information Detail" : `Part ${idx + 1}`);

          const tl = rawParsedTitle.toLowerCase();
          let category = 'general';
          if (tl.includes('lesson') || tl.includes('পাঠ')) category = 'lesson';
          else if (tl.includes('activ') || tl.includes('শ্ৰেণ')) category = 'activity';
          else if (tl.includes('home') || tl.includes('গৃহ') || tl.includes('ঘৰ')) category = 'homework';
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

          let body = section.replace(/^(?:\s*(?:\d[.)]\s*)?)(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|শ্ৰেণীকক্ষৰ কাৰ্যসূচী|গৃহকাৰ্য|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i, '');
          body = body.replace(/---/g, '').replace(/\*/g, '').replace(/\.\./g, '').trim().replace(/^[\s:)*-]+/, '').replace(/[\s:(*-]+$/, '').trim();
          
          // Skip if body is basically empty or just punctuation (like the 'dot' issue)
          if (body.length < 2 && idx > 0) return null;

          const iconMap = {
              'general': <Sparkles className="w-5 h-5" />,
              'lesson': <BookOpen className="w-5 h-5" />,
              'activity': <ClipboardList className="w-5 h-5" />,
              'homework': <PenTool className="w-5 h-5" />,
              'assessment': <CheckSquare className="w-5 h-5" />
          };

          return (
              <div key={idx} className="group animate-in slide-in-from-bottom-4 duration-500 stagger-item page-break-inside-avoid" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-pm-green shadow-sm group-hover:bg-pm-green group-hover:text-white transition-all transform group-hover:scale-110">
                          {iconMap[category] || <Sparkles className="w-5 h-5" />}
                      </div>
                      <h3 className="text-2xl font-black font-heading text-gray-900 border-b-4 border-pm-green/10 pb-1">{finalTitle}</h3>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-8 rounded-3xl border border-gray-100 font-medium leading-8 shadow-inner ring-1 ring-gray-100/50">
                      {body}
                  </div>
              </div>
          );
      }).filter(Boolean);
  };

  const handleGenerate = async (e, overrideData = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading || (lockExpiry && Date.now() < lockExpiry)) return;
    
    setLoading(true);
    setResult(""); // Start with empty string for streaming
    setIsSaved(false);
    
    try {
      const payload = overrideData || formData;
      const response = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('pm_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errData = await response.json();
          if (errData.resetAt) {
              setLockExpiry(errData.resetAt);
              localStorage.setItem('pm_lock_expiry', errData.resetAt.toString());
          } else {
              const fallback = Date.now() + 65000;
              setLockExpiry(fallback);
              localStorage.setItem('pm_lock_expiry', fallback.toString());
          }
          throw new Error(errData.error || 'Generation failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chunk) {
                accumulatedContent += parsed.chunk;
                setResult(accumulatedContent);
              } else if (parsed.error) {
                if (parsed.resetAt) {
                    setLockExpiry(parsed.resetAt);
                    localStorage.setItem('pm_lock_expiry', parsed.resetAt.toString());
                }
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore small parse errors during stream
            }
          }
        }
      }
    } catch (err) {
      console.error('Generation failure:', err);
      const errMsg = err.message || 'Generation failed. Please try again.';
      alert(errMsg);
      // Fallback lock ONLY if no specific resetAt was provided by backend
      if (!err.resetAt && !lockExpiry && (errMsg.toLowerCase().includes('wait') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('limit'))) {
          const newExpiry = Date.now() + 65000;
          setLockExpiry(newExpiry);
          localStorage.setItem('pm_lock_expiry', newExpiry.toString());
      }
    } finally {
      setLoading(false);
      fetchProfile();
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

  const handlePrint = (item = null) => {
    // Track download event
    const trackDownload = async () => {
      try {
        await axios.post(`${API_URL}/api/creations/track-download`, null, {
            headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
      } catch (err) { console.warn("Track sync failed"); }
    };
    trackDownload();

    const originalTitle = document.title;
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;
    
    const targetSubject = item ? item.subject : formData.subject;
    const targetClass = item ? item.class : formData.className;
    
    const cleanSubject = (targetSubject || 'material').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cleanClass = (targetClass || '0').toString().replace(/[^a-z0-9]/g, '_');
    
    document.title = `${dateStr}_class_${cleanClass}_${cleanSubject}`;
    window.print();
    document.title = originalTitle;
  };

  const handleDownloadFromHistory = async (item) => {
      try {
          setHistoryDownloadingId(item.id);
          // Fetch full content only when needed
          const response = await axios.get(`${API_URL}/api/creations/get/${item.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
          });
          setPrintData(response.data);
          setTimeout(() => {
              handlePrint(response.data);
              setPrintData(null);
          }, 500);
      } catch (err) {
          alert("Failed to retrieve archived content for PDF Generation.");
      } finally {
          setHistoryDownloadingId(null);
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 overflow-y-auto print:hidden no-print">
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
            <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col items-center">
                <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">PaathSohayok Dev</p>
                <p className="text-[11px] font-bold text-pm-green/40 mt-1">Manashjyoti Barman</p>
            </div>
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
                                        onClick={() => {
                                            const mappedData = { ...formData, language: lang };
                                            setFormData(mappedData);
                                            // Auto-generate if enough logic exists
                                            if (result && mappedData.className && mappedData.subject && mappedData.topic) {
                                                handleGenerate(null, mappedData);
                                            }
                                        }}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.language === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

                                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                                    {(profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit) && (
                                        <p className="text-rose-600 font-bold text-sm bg-rose-50 px-4 py-2 rounded-lg border border-rose-100 flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            Contact the admin to increase your limit
                                        </p>
                                    )}
                                    <button 
                                        type="submit"
                                        disabled={loading || (lockExpiry && currentTime < lockExpiry) || (profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit)}
                                        className={`pm-button-primary px-10 py-5 flex flex-col items-center justify-center transition-all group shadow-2xl relative overflow-hidden transition-standard ${(lockExpiry || (profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit)) ? 'bg-gray-400 cursor-not-allowed border-gray-100' : 'bg-pm-green border-pm-green hover:bg-green-700 active:scale-95'}`}
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
                                                        READY AT {new Date(lockExpiry).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
                                                    </div>
                                                     <div className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">
                                                         Wait {(() => {
                                                             const diff = lockExpiry - currentTime;
                                                             const hours = Math.floor(diff / 3600000);
                                                             const mins = Math.floor((diff % 3600000) / 60000);
                                                             const secs = Math.floor((diff % 60000) / 1000);
                                                             if (hours > 0) return `${hours}h ${mins}m`;
                                                             return `${mins}m ${secs}s`;
                                                         })()}
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
                    ) : resetTimer ? (
                         <div className="h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                             <div className="mb-6 p-5 bg-pm-green/10 rounded-full border border-pm-green/20 relative">
                                 <CheckCircle className="w-12 h-12 text-pm-green" />
                                 <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-[3px] border-pm-green/30 border-t-pm-green"
                                 ></motion.div>
                             </div>
                             <h4 className="text-2xl font-black font-heading text-gray-900">Resource Saved & Synced!</h4>
                             <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed font-bold tracking-tight">Preparing standard dashboard for immediate composition iteration...</p>
                         </div>
                    ) : result ? (
                        <div ref={contentRef} className="space-y-8 animate-in fade-in duration-500 scroll-mt-6">
                            {/* Resource Header Panel */}
                            <div className="flex justify-between items-center mb-6 pt-4 border-b border-gray-100 pb-6 print:hidden no-print">
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
                                        disabled={saving || isSaved}
                                        onClick={() => saveCreation(true)}
                                        className={`pm-button-secondary py-2 flex items-center gap-2 transition-all shadow-sm ${isSaved ? 'bg-pm-green text-white border-pm-green' : 'bg-pm-green/5 text-pm-green border-pm-green/20 hover:bg-pm-green hover:text-white'}`}
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                        <span className="text-sm font-bold">{saving ? 'Syncing...' : isSaved ? 'Saved Draft' : 'Save Draft'}</span>
                                    </button>
                                    <button 
                                         onClick={() => handlePrint(null)}
                                         className="pm-button-primary bg-indigo-600 hover:bg-indigo-700 py-2 flex items-center gap-2 shadow-lg shadow-indigo-900/10"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="text-sm font-bold text-white">Download PDF</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Document Body */}
                            <div className="pm-card p-12 bg-white shadow-xl ring-1 ring-gray-100 print:shadow-none print:ring-0 transition-standard hover:shadow-2xl">
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
                                    {renderDocumentSections(result, formData.language, false)}
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
                <div className="print:hidden no-print">
                    <header className="mb-10 flex justify-between items-end">
                       <div>
                          <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight">Creation History</h2>
                          <p className="text-gray-500 text-sm mt-1">Review, manage and download your previously generated teaching materials.</p>
                       </div>
                    </header>

                    <div className="pm-card shadow-sm border-gray-100 bg-white overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
                            <h3 className="text-lg font-bold font-heading">Archived Resources</h3>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder="Filter your history..."
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
                                        <th className="px-6 py-4">Resource Details</th>
                                        <th className="px-6 py-4">Class / Subject</th>
                                        <th className="px-6 py-4 text-center">Language</th>
                                        <th className="px-6 py-4">Generation Date</th>
                                        <th className="px-6 py-4 text-right pr-12">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-gray-400 text-sm">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-pm-green mb-4" />
                                                    <span className="font-semibold tracking-wide animate-pulse">Syncing your records...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-gray-400 text-sm italic">
                                                <div className="flex flex-col items-center justify-center">
                                                    <History className="w-12 h-12 text-gray-200 mb-4" />
                                                    <h3 className="text-lg font-bold text-gray-500">No Records Found</h3>
                                                    <p className="text-sm text-gray-400 mt-1">Try a different search or generate new content to populate history.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedHistory.map((item, idx) => (
                                            <tr key={item.id} className={`${idx % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'} hover:bg-green-50/30 transition-colors group cursor-default`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-pm-green group-hover:bg-pm-green group-hover:text-white transition-all shadow-sm">
                                                            <FileText className="w-5 h-5 flex-shrink-0" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{item.file_name || 'Untitled Generation'}</p>
                                                            <p className="text-[10px] text-pm-green font-bold uppercase mt-1 tracking-tight">{item.topic}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600">GRADE {item.class}</span>
                                                        <p className="text-sm font-medium text-gray-600">{item.subject}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.language === 'Assamese' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                        {item.language || 'English'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-[11px] text-gray-400 font-bold whitespace-pre-wrap uppercase leading-normal">
                                                        {new Date(item.created_at).toLocaleDateString()} <br/>
                                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-10 whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-3 transition-opacity">
                                                        <button 
                                                            onClick={() => handleDownloadFromHistory(item)}
                                                            disabled={historyDownloadingId === item.id}
                                                            className="p-2.5 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm border border-indigo-100/50 disabled:opacity-50"
                                                            title="Download PDF"
                                                        >
                                                            {historyDownloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteFromHistory(item.id)}
                                                            className="p-2.5 text-rose-500 bg-rose-50/50 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm border border-rose-100/50"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {!loading && totalHistoryPages > 1 && (
                                <div className="flex justify-between items-center px-8 py-4 bg-gray-50/50 border-t border-gray-100">
                                    <span className="text-sm font-semibold text-gray-500">Page {historyPage} of {totalHistoryPages}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={historyPage === 1}
                                            onClick={() => setHistoryPage(p => p - 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            Previous
                                        </button>
                                        <button 
                                            disabled={historyPage === totalHistoryPages}
                                            onClick={() => setHistoryPage(p => p + 1)}
                                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
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

      {/* Hidden Print Overlay for direct History Item generation without viewing */}
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

      {/* Styles for print */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .pm-card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 2rem !important; }
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
