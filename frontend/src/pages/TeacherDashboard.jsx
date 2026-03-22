import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, BookOpen, Presentation, ClipboardList, PenTool, CheckSquare, Library, Copy, Download, RotateCcw, ChevronDown, CheckCircle, LayoutDashboard, Settings, HelpCircle, History, FileText, Loader2, Trash2, X, Cloud, Save, Timer, Lock, Search } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const TeacherDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'history', 'settings'
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
  const [downloadingId, setDownloadingId] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetTimer, setResetTimer] = useState(false);
  const [printData, setPrintData] = useState(null);
  const contentRef = useRef();

  useEffect(() => {
    setHistoryPage(1);
    setSearchTerm('');
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

  // Restored Auto-Scroll logic
  useEffect(() => {
    if (result && !resetTimer && contentRef.current) {
        setTimeout(() => {
            contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    }
  }, [result, resetTimer]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/creations/my`, {
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
      const sections = resultStr.split(/(?=Lesson Plan|Classroom Activities|Homework|Assessment Questions|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন|INFORMATION|তথ্য)/i).filter(s => s.trim().length > 5);

      return sections.map((section, idx) => {
          const rawTitleMatch = section.match(/^(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|গৃহকাৰ্য|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i);
          // Fixed title logic to prevent duplication
          const rawParsedTitle = rawTitleMatch ? rawTitleMatch[1] : (idx === 0 ? "Information Detail" : `Part ${idx + 1}`);

          const tl = rawParsedTitle.toLowerCase();
          let category = 'general';
          if (tl.includes('lesson') || tl.includes('পাঠ')) category = 'lesson';
          else if (tl.includes('activ') || tl.includes('শ্ৰেণ')) category = 'activity';
          else if (tl.includes('home') || tl.includes('গৃহ')) category = 'homework';
          else if (tl.includes('assess') || tl.includes('মূল্যা')) category = 'assessment';

          let finalTitle = rawParsedTitle;
          if (language.toLowerCase() === 'assamese') {
              if (category === 'general' && !rawTitleMatch) finalTitle = 'Information (তথ্য)';
              else if (category === 'lesson') finalTitle = 'Lesson Plan (পাঠ পৰিকল্পনা)';
              else if (category === 'activity') finalTitle = 'Classroom Activities (শ্ৰেণীকক্ষৰ কাৰ্যসূচী)';
              else if (category === 'homework') finalTitle = 'Homework (গৃহকাৰ্য)';
              else if (category === 'assessment') finalTitle = 'Assessment Questions (মূল্যায়নৰ প্ৰশ্ন)';
          } else {
              if (category === 'general' && !rawTitleMatch) finalTitle = 'Information Detail';
              else if (category === 'lesson') finalTitle = 'Lesson Plan';
              else if (category === 'activity') finalTitle = 'Classroom Activities';
              else if (category === 'homework') finalTitle = 'Homework';
              else if (category === 'assessment') finalTitle = 'Assessment Questions';
          }

          let body = section.replace(/^(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|Assessmenrt Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|গৃহকাৰ্য|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i, '');
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
    setResult(""); 
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
                throw new Error(parsed.error);
              }
            } catch (e) { }
          }
        }
      }
    } catch (err) {
      console.error('Generation failure:', err);
      alert(err.message || 'Generation failed. Please try again.');
      if (err.message.toLowerCase().includes('wait') || err.message.toLowerCase().includes('quota')) {
          setLockExpiry(Date.now() + 60000); 
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

  const handlePrint = (item = null) => {
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
          alert("Failed to retrieve archived content for PDF Generation.");
      } finally {
          setDownloadingId(null);
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-inter text-gray-900">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 overflow-y-auto print:hidden no-print">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <div className="w-9 h-9 bg-pm-green rounded-lg flex items-center justify-center text-white shadow-sm">
                <Library className="w-5 h-5 flex-shrink-0" />
            </div>
            <div className="flex flex-col">
                <span className="font-bold text-lg font-heading text-gray-900 leading-none">PaathSohayok</span>
                <span className="text-[10px] block -mt-1 font-semibold text-pm-green tracking-widest uppercase">পাকটসহায়ক</span>
            </div>
        </div>

        <nav className="p-4 space-y-1 mt-4">
            <button onClick={() => setActiveTab('generate')} className={`pm-sidebar-item w-full ${activeTab === 'generate' ? 'active' : ''}`}><Sparkles className="w-4 h-4" />Generate AI Content</button>
            <button onClick={() => setActiveTab('history')} className={`pm-sidebar-item w-full ${activeTab === 'history' ? 'active' : ''}`}><History className="w-4 h-4" />Creation History</button>
            <button onClick={() => setActiveTab('settings')} className={`pm-sidebar-item w-full ${activeTab === 'settings' ? 'active' : ''}`}><Settings className="w-4 h-4" />App Settings</button>
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
            <button onClick={handleLogOut} className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-lg transition-all"><LogOut className="w-4 h-4" />Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 print:ml-0 print:p-0">
        <div className="max-w-5xl mx-auto pb-20">
            {activeTab === 'generate' && (
                <>
                <header className="mb-10 no-print text-center">
                    <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight">Content Studio</h2>
                    <p className="text-gray-500 text-sm mt-1">Design high-quality lesson materials with artificial intelligence assistance.</p>
                </header>

                <div className="pm-card p-10 shadow-sm border-gray-100 bg-white mb-10 no-print">
                    <form onSubmit={handleGenerate} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <InputGroup label="Target Class" desc="Select student level">
                                <div className="relative">
                                    <select className="pm-input appearance-none bg-gray-50/30 pl-4 py-3" value={formData.className} onChange={(e) => setFormData({...formData, className: e.target.value})} required>
                                        <option value="">Select Grade</option>
                                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Grade {i+1}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </InputGroup>
                            <InputGroup label="Subject" desc="Core academic subject"><input type="text" className="pm-input bg-gray-50/30 py-3" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required /></InputGroup>
                            <InputGroup label="Topic" desc="Main chapter"><input type="text" className="pm-input bg-gray-50/30 py-3" value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} required /></InputGroup>
                            <InputGroup label="Sub-Topic" desc="Specific segment"><input type="text" className="pm-input bg-gray-50/30 py-3" value={formData.subTopic} onChange={(e) => setFormData({...formData, subTopic: e.target.value})} required /></InputGroup>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-12">
                             <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                                {['English', 'Assamese'].map((lang) => (
                                    <button key={lang} type="button" onClick={() => setFormData({...formData, language: lang})} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${formData.language === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{lang}</button>
                                ))}
                            </div>
                            <button type="submit" disabled={loading} className="pm-button-primary px-10 py-5 bg-pm-green text-white font-black uppercase tracking-widest rounded-2xl flex items-center gap-4">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                Compose Material
                            </button>
                        </div>
                    </form>
                </div>

                {result && (
                    <div ref={contentRef} className="space-y-8 animate-in fade-in duration-500 scroll-mt-6">
                        <div className="flex justify-between items-center mb-6 pt-4 border-b border-gray-100 pb-6 print:hidden no-print">
                            <h3 className="text-xl font-bold font-heading">Educator's Resource Panel</h3>
                            <div className="flex gap-4">
                                <button disabled={saving || isSaved} onClick={() => saveCreation(true)} className="pm-button-secondary bg-pm-green/5 text-pm-green border-pm-green/20 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Syncing...' : isSaved ? 'Saved' : 'Save Draft'}
                                </button>
                                <button onClick={() => handlePrint(null)} className="pm-button-primary bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg">
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                            </div>
                        </div>

                        <div className="pm-card p-12 bg-white shadow-xl ring-1 ring-gray-100 print:shadow-none print:ring-0">
                            <div className="border-b-2 border-pm-green/30 pb-8 mb-10 text-center">
                                <h1 className="text-2xl font-black text-pm-green uppercase">{formData.subject} - {formData.topic}</h1>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Standard {formData.className} • {formData.language} Medium</p>
                            </div>
                            <div className="space-y-16">
                                {renderDocumentSections(result, formData.language, false)}
                            </div>
                        </div>
                    </div>
                )}
                </>
            )}

            {activeTab === 'history' && (
                <div className="pm-card shadow-sm border-gray-100 bg-white overflow-hidden p-6">
                    <h2 className="text-2xl font-bold mb-8">Creation History</h2>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[11px] uppercase tracking-widest font-bold">
                            <tr><th className="px-6 py-4">Resource</th><th className="px-6 py-4">Context</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedHistory.map(item => (
                                <tr key={item.id} className="hover:bg-green-50/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-sm">{item.file_name}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-600">Grade {item.class} • {item.subject}</td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-bold">{new Date(item.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button disabled={downloadingId === item.id} onClick={() => handleDownloadFromHistory(item)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg">
                                            {downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => deleteFromHistory(item.id)} className="p-2 text-rose-500 bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </main>

      {printData && (
          <div className="hidden print:block absolute top-0 left-0 w-full min-h-screen bg-white z-[99999] p-12">
              <div className="border-b-2 border-pm-green/30 pb-8 mb-10 text-center">
                  <h1 className="text-2xl font-black text-pm-green uppercase">{printData.subject} - {printData.topic}</h1>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-none">Standard {printData.class} • {printData.language} Medium</p>
              </div>
              <div className="space-y-12">
                  {renderDocumentSections(printData.content, printData.language, true)}
              </div>
          </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          main { margin-left: 0 !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

const InputGroup = ({ label, desc, children }) => (
    <div className="space-y-3">
        <div><label className="block text-sm font-bold text-gray-800 leading-tight">{label}</label><p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1">{desc}</p></div>
        {children}
    </div>
);

export default TeacherDashboard;
