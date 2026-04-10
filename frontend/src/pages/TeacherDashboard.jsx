import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sparkles, BookOpen, Presentation, ClipboardList, PenTool, CheckSquare, Library, Copy, Download, RotateCcw, ChevronDown, CheckCircle, LayoutDashboard, Settings, HelpCircle, History, FileText, Loader2, Trash2, X, Cloud, Save, Timer, Lock, Search, ExternalLink, Upload, FileQuestion } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const TeacherDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate'); // 'generate', 'assessment', 'history', 'settings'
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
  const [profileLoaded, setProfileLoaded] = useState(false);
  const contentRef = useRef();

  // Assessment tab state
  const [assessFile, setAssessFile] = useState(null);
  const [assessQuestionCount, setAssessQuestionCount] = useState(5);
  const [assessLanguage, setAssessLanguage] = useState('English');
  const [assessLoading, setAssessLoading] = useState(false);
  const [assessResult, setAssessResult] = useState(null);
  const [assessSaving, setAssessSaving] = useState(false);
  const [assessSaved, setAssessSaved] = useState(false);
  const [assessResetTimer, setAssessResetTimer] = useState(false);
  const assessFileRef = useRef();

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
    } finally {
      setProfileLoaded(true);
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
        language: formData.language
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      
      setIsSaved(true);
      if (manual) {
          setResetTimer(true);
          setTimeout(() => {
              setResult(null);
              setResetTimer(false);
              setIsSaved(false);
              setFormData({
                  className: '',
                  subject: '',
                  topic: '',
                  subTopic: '',
                  language: 'English'
              });
          }, 2500);
      }
    } catch (err) {
      console.error('Failed to save creation');
      if (manual) alert("Cloud synchronization failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // --- Assessment Handlers ---
  const handleAssessGenerate = async (e) => {
    if (e) e.preventDefault();
    if (assessLoading || !assessFile) return;

    setAssessLoading(true);
    setAssessResult('');
    setAssessSaved(false);

    try {
      const fd = new FormData();
      fd.append('file', assessFile);
      fd.append('questionCount', assessQuestionCount);
      fd.append('language', assessLanguage);

      const response = await fetch(`${API_URL}/api/assessment/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('pm_token')}` },
        body: fd
      });

      if (!response.ok) {
        const errData = await response.json();
        if (errData.resetAt) {
            setLockExpiry(errData.resetAt);
            localStorage.setItem('pm_lock_expiry', errData.resetAt.toString());
        } else if (response.status === 429) {
            const fallback = Date.now() + 65000;
            setLockExpiry(fallback);
            localStorage.setItem('pm_lock_expiry', fallback.toString());
        }
        throw new Error(errData.error || 'Assessment generation failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch (e) {
              continue; // ignore small parse errors
            }
            
            if (parsed.chunk) {
              accumulated += parsed.chunk;
              setAssessResult(accumulated);
            } else if (parsed.error) {
              if (parsed.resetAt) {
                  setLockExpiry(parsed.resetAt);
                  localStorage.setItem('pm_lock_expiry', parsed.resetAt.toString());
              }
              throw new Error(parsed.error);
            }
          }
        }
      }
    } catch (err) {
      console.error('Assessment failure:', err);
      const errMsg = err.message || 'Assessment generation failed.';
      alert(errMsg);
      // Fallback lock ONLY if no specific resetAt was provided by backend
      if (!err.resetAt && !lockExpiry && (errMsg.toLowerCase().includes('wait') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('limit'))) {
          const newExpiry = Date.now() + 65000;
          setLockExpiry(newExpiry);
          localStorage.setItem('pm_lock_expiry', newExpiry.toString());
      }
    } finally {
      setAssessLoading(false);
      fetchProfile();
    }
  };

  const saveAssessment = async () => {
    if (!assessResult || !user?.id) return;
    try {
      setAssessSaving(true);
      await axios.post(`${API_URL}/api/creations`, {
        userId: user.id,
        fileName: `Assessment_${assessFile?.name || 'Upload'}`,
        content: assessResult,
        className: 'Assessment',
        subject: assessFile?.name || 'Uploaded File',
        topic: `${assessQuestionCount} Questions`,
        language: assessLanguage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
      });
      setAssessSaved(true);
      setAssessResetTimer(true);
      setTimeout(() => {
        setAssessResult(null);
        setAssessResetTimer(false);
        setAssessSaved(false);
        setAssessFile(null);
        setAssessQuestionCount(5);
        if (assessFileRef.current) assessFileRef.current.value = '';
      }, 2500);
    } catch (err) {
      console.error('Failed to save assessment');
      alert('Failed to save assessment. Please try again.');
    } finally {
      setAssessSaving(false);
    }
  };

  const handleAssessPrint = () => {
    const trackDownload = async () => {
      try {
        await axios.post(`${API_URL}/api/creations/track-download`, null, {
          headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
        });
      } catch (err) { console.error('Download tracking failed'); }
    };
    trackDownload();

    setPrintData({
      subject: 'Assessment',
      topic: `${assessQuestionCount} Questions from ${assessFile?.name || 'Upload'}`,
      class: 'Assessment',
      language: assessLanguage,
      content: assessResult
    });
    setTimeout(() => { window.print(); setPrintData(null); }, 500);
  };

  const deleteFromHistory = async (id) => {
      if (!window.confirm("Are you sure you want to remove this resource from your history?")) return;
      try {
          await axios.delete(`${API_URL}/api/creations/${id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
          });
          setHistory(prev => prev.filter(item => item.id !== id));
      } catch (err) {
          console.error('Failed to delete history item');
          alert("Failed to delete the resource. Please try again.");
      }
  };

  const handleDownloadFromHistory = async (item) => {
      try {
          setHistoryDownloadingId(item.id);
          const response = await axios.get(`${API_URL}/api/creations/get/${item.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('pm_token')}` }
          });
          
          if (response.data && response.data.content) {
              const fullItem = { ...item, content: response.data.content };
              handlePrint(fullItem);
          } else {
              throw new Error("Content not found");
          }
      } catch (err) {
          console.error('Failed to fetch item for download:', err);
          alert("Failed to prepare the download. Please try again.");
      } finally {
          setHistoryDownloadingId(null);
      }
  };

  const filteredHistory = history.filter(item => 
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
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch (e) {
              continue; // Ignore small parse errors during stream
            }

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
      } catch (err) {
        console.error('Download tracking failed');
      }
    };
    trackDownload();

    const dataToPrint = item || {
      subject: formData.subject,
      topic: formData.topic,
      class: formData.className,
      language: formData.language,
      content: result
    };
    
    setPrintData(dataToPrint);
    setTimeout(() => {
        window.print();
        setPrintData(null);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-inter">
      <Helmet>
        <title>Generate Learning Content in Minutes | PaathSohayok</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
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
                onClick={() => setActiveTab('assessment')}
                className={`pm-sidebar-item w-full ${activeTab === 'assessment' ? 'active' : ''}`}
            >
                <FileQuestion className="w-4 h-4" />Assessment
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
            {!profileLoaded ? (
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-pm-green/10 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-pm-green border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 font-heading">Verifying Educator Quota</h2>
                    <p className="text-sm text-gray-500 mt-2">Checking your content limit and synchronizing session...</p>
                </div>
            ) : (
                <>
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
                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <InputGroup label="Target Class" desc="SELECT STUDENT LEVEL">
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pm-green transition-colors"></div>
                                            <select 
                                                className="pm-input bg-gray-50/50 appearance-none pl-4 pr-10 py-3 text-gray-700"
                                                value={formData.className}
                                                onChange={(e) => setFormData({...formData, className: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Grade</option>
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i+1} value={`Class ${i+1}`}>Class {i+1}</option>
                                                ))}
                                                <option value="Degree">Degree/College</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </InputGroup>

                                    <InputGroup label="Subject Division" desc="CORE ACADEMIC SUBJECT">
                                        <input 
                                            type="text"
                                            className="pm-input bg-gray-50/50 py-3"
                                            placeholder="e.g. Political Science"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            required
                                        />
                                    </InputGroup>

                                    <InputGroup label="Primary Topic" desc="THE MAIN CHAPTER OR CONCEPT">
                                        <input 
                                            type="text" 
                                            className="pm-input bg-gray-50/50 py-3"
                                            placeholder="e.g. Fundamental Rights"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                            required
                                        />
                                    </InputGroup>

                                    <InputGroup label="Sub-Topic Detail" desc="SPECIFIC SEGMENT WITHIN THE TOPIC">
                                        <input 
                                            type="text"
                                            className="pm-input bg-gray-50/50 py-3"
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

                                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                            {(profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit) && (
                                                <p className="text-[#E11D48] font-bold text-xs bg-[#FFF1F2] px-4 py-2.5 rounded-lg border border-[#FFE4E6] flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                    <Lock className="w-3.5 h-3.5" />
                                                    Contact the admin to increase your limit
                                                </p>
                                            )}
                                            <button 
                                                type="submit"
                                                disabled={loading || (lockExpiry && currentTime < lockExpiry) || (profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit)}
                                                className={`pm-button-primary px-10 py-4.5 min-w-[280px] flex flex-col items-center justify-center transition-all group relative overflow-hidden transition-standard shadow-lg ${(lockExpiry || (profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit)) ? 'bg-slate-300 cursor-not-allowed opacity-80 border-slate-200' : 'bg-pm-green border-pm-green hover:bg-green-700 active:scale-95'}`}
                                            >
                                                {loading ? (
                                                    <div className="flex items-center gap-3">
                                                       <Loader2 className="w-5 h-5 animate-spin text-white" />
                                                       <span className="text-lg font-black text-white uppercase tracking-widest">Synthesizing...</span>
                                                    </div>
                                                ) : lockExpiry && currentTime < lockExpiry ? (
                                                    <div className="flex flex-col items-center leading-none text-center">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <Timer className="w-4 h-4 text-white/90 animate-pulse" />
                                                            <span className="text-lg font-black text-white uppercase tracking-tight">AI Recovering...</span>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="text-[12px] font-black text-white tracking-widest">
                                                                READY AT {new Date(lockExpiry).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <Sparkles className="w-5 h-5 flex-shrink-0 text-white group-hover:rotate-12 transition-transform opacity-90" />
                                                        <span className="text-lg font-black text-white uppercase tracking-[0.15em] py-0.5">Compose Material</span>
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
                                            <a 
                                                 href={`/learn/${(formData.className || '').toLowerCase().replace(' ', '-')}/${(formData.subject || '').toLowerCase().replace(' ', '-')}/${(formData.topic || '').toLowerCase().replace(' ', '-')}`}
                                                 target="_blank"
                                                 rel="noopener noreferrer"
                                                 className="pm-button-secondary py-2 flex items-center gap-2 group hover:border-pm-green/30"
                                            >
                                                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pm-green transition-colors" />
                                                <span className="text-sm font-bold">Public Preview</span>
                                            </a>
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
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Creation Detail</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Standard & Medium</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right pr-10">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="3" className="px-8 py-20 text-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-pm-green mx-auto mb-4" />
                                                        <p className="text-gray-400 font-bold text-sm">Retrieving your archives...</p>
                                                    </td>
                                                </tr>
                                            ) : paginatedHistory.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-8 py-20 text-center">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                            <History className="w-8 h-8 text-gray-200" />
                                                        </div>
                                                        <p className="text-gray-400 font-bold text-sm">No materials found in your history.</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedHistory.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-green-50 text-pm-green flex items-center justify-center font-bold text-xs shadow-sm">
                                                                    {item.subject ? item.subject.charAt(0).toUpperCase() : 'A'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 group-hover:text-pm-green transition-colors">{item.topic || 'Untitled Creation'}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.subject}</span>
                                                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                                        <span className="text-[10px] font-medium text-gray-400">{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-tight w-fit">
                                                                    {item.class || 'N/A'}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.language === 'Assamese' ? 'bg-orange-400' : 'bg-indigo-400'}`}></div>
                                                                    <span className="text-[10px] font-bold text-gray-400">{item.language} Medium</span>
                                                                </div>
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

                    {activeTab === 'assessment' && (
                        <>
                        <header className="mb-10 no-print">
                            <h2 className="text-3xl font-bold font-heading text-gray-900 tracking-tight flex items-center gap-3">
                                Assessment Generator
                                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-200 font-bold tracking-widest uppercase">NEW</span>
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Upload an image or PDF and generate assessment questions from its content.</p>
                        </header>

                        <div className="pm-card p-10 shadow-sm border-gray-100 bg-white mb-10 no-print">
                            <h3 className="text-lg font-bold font-heading mb-8 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-pm-green" />
                                Upload & Configure
                            </h3>

                            <form onSubmit={handleAssessGenerate} className="space-y-8">
                                {/* File Upload */}
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 leading-tight">Upload File</label>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1">PDF OR IMAGE (PNG, JPG, WEBP) — MAX 10MB</p>
                                    </div>
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer hover:border-pm-green/40 hover:bg-green-50/30 ${
                                            assessFile ? 'border-pm-green bg-green-50/20' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                        onClick={() => assessFileRef.current?.click()}
                                    >
                                        <input
                                            ref={assessFileRef}
                                            type="file"
                                            accept=".pdf,.png,.jpg,.jpeg,.webp"
                                            className="hidden"
                                            onChange={(e) => setAssessFile(e.target.files[0] || null)}
                                        />
                                        {assessFile ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="w-8 h-8 text-pm-green" />
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900 text-sm">{assessFile.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-semibold">{(assessFile.size / 1024).toFixed(1)} KB • Click to change</p>
                                                </div>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); setAssessFile(null); if(assessFileRef.current) assessFileRef.current.value=''; }} className="ml-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-gray-500">Click to upload or drag & drop</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-semibold">Supports PDF, PNG, JPG, WebP</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Question Count */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-800 leading-tight">Number of Questions</label>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1">MAXIMUM 10 QUESTIONS PER GENERATION</p>
                                        </div>
                                        <div className="relative">
                                            <select
                                                className="pm-input bg-gray-50/50 appearance-none pl-4 pr-10 py-3 text-gray-700 w-full"
                                                value={assessQuestionCount}
                                                onChange={(e) => setAssessQuestionCount(parseInt(e.target.value))}
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i+1} value={i+1}>{i+1} Question{i > 0 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Language Toggle + Submit */}
                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-12">
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
                                        {['English', 'Assamese'].map((lang) => (
                                            <button
                                                key={lang}
                                                type="button"
                                                onClick={() => setAssessLanguage(lang)}
                                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${assessLanguage === lang ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                        {(profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit) && (
                                            <p className="text-[#E11D48] font-bold text-xs bg-[#FFF1F2] px-4 py-2.5 rounded-lg border border-[#FFE4E6] flex items-center gap-2">
                                                <Lock className="w-3.5 h-3.5" />
                                                Contact the admin to increase your limit
                                            </p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={assessLoading || !assessFile || (lockExpiry && currentTime < lockExpiry) || (profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit)}
                                            className={`pm-button-primary px-10 py-4.5 min-w-[280px] flex flex-col items-center justify-center transition-all group relative overflow-hidden transition-standard shadow-lg ${
                                                (!assessFile || lockExpiry || (profile?.role !== 'admin' && profile?.content_count >= profile?.content_limit))
                                                ? 'bg-slate-300 cursor-not-allowed opacity-80 border-slate-200'
                                                : 'bg-pm-green border-pm-green hover:bg-green-700 active:scale-95'
                                            }`}
                                        >
                                            {assessLoading ? (
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                                    <span className="text-lg font-black text-white uppercase tracking-widest">Generating...</span>
                                                </div>
                                            ) : lockExpiry && currentTime < lockExpiry ? (
                                                <div className="flex flex-col items-center leading-none text-center">
                                                    <div className="flex items-center gap-2 mb-1.5">
                                                        <Timer className="w-4 h-4 text-white/90 animate-pulse" />
                                                        <span className="text-lg font-black text-white uppercase tracking-tight">AI Recovering...</span>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="text-[12px] font-black text-white tracking-widest">
                                                            READY AT {new Date(lockExpiry).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <FileQuestion className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                                                    <span className="text-lg font-black text-white uppercase tracking-[0.15em] py-0.5">Generate Assessment</span>
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Assessment Results Area */}
                        <div className="space-y-12">
                            {assessLoading ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                        className="mb-6 p-4 bg-amber-50 rounded-full border border-amber-100"
                                    >
                                        <FileQuestion className="w-10 h-10 text-amber-500" />
                                    </motion.div>
                                    <h4 className="text-xl font-bold font-heading text-gray-900">Analyzing Content & Crafting Questions</h4>
                                    <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed">Our AI is reading your document and generating targeted assessment questions.</p>
                                </div>
                            ) : assessResetTimer ? (
                                <div className="h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                                    <div className="mb-6 p-5 bg-pm-green/10 rounded-full border border-pm-green/20 relative">
                                        <CheckCircle className="w-12 h-12 text-pm-green" />
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                                            className="absolute inset-0 rounded-full border-[3px] border-pm-green/30 border-t-pm-green"
                                        ></motion.div>
                                    </div>
                                    <h4 className="text-2xl font-black font-heading text-gray-900">Assessment Saved & Synced!</h4>
                                    <p className="text-gray-500 text-sm mt-3 max-w-xs leading-relaxed font-bold">Resetting workspace for next assessment...</p>
                                </div>
                            ) : assessResult ? (
                                <div className="space-y-8 animate-in fade-in duration-500 scroll-mt-6">
                                    {/* Action bar */}
                                    <div className="flex justify-between items-center mb-6 pt-4 border-b border-gray-100 pb-6 print:hidden no-print">
                                        <h3 className="text-xl font-bold font-heading text-gray-900">Generated Assessment</h3>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(assessResult); setCopied('assess'); setTimeout(() => setCopied(''), 2000); }}
                                                className="pm-button-secondary py-2 flex items-center gap-2 group hover:border-pm-green/30"
                                            >
                                                {copied === 'assess' ? <CheckCircle className="w-4 h-4 text-pm-green" /> : <Copy className="w-4 h-4 text-gray-400 group-hover:text-pm-green transition-colors" />}
                                                <span className="text-sm font-bold">Copy All</span>
                                            </button>
                                            <button
                                                disabled={assessSaving || assessSaved}
                                                onClick={saveAssessment}
                                                className={`pm-button-secondary py-2 flex items-center gap-2 transition-all shadow-sm ${assessSaved ? 'bg-pm-green text-white border-pm-green' : 'bg-pm-green/5 text-pm-green border-pm-green/20 hover:bg-pm-green hover:text-white'}`}
                                            >
                                                {assessSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : assessSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                                <span className="text-sm font-bold">{assessSaving ? 'Syncing...' : assessSaved ? 'Saved' : 'Save'}</span>
                                            </button>
                                            <button
                                                onClick={handleAssessPrint}
                                                className="pm-button-primary bg-indigo-600 hover:bg-indigo-700 py-2 flex items-center gap-2 shadow-lg shadow-indigo-900/10"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span className="text-sm font-bold text-white">Download PDF</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="pm-card p-12 bg-white shadow-xl ring-1 ring-gray-100 print:shadow-none print:ring-0">
                                        <div className="border-b-2 border-amber-500/30 pb-8 mb-10 relative">
                                            <div className="flex justify-between items-end relative z-10">
                                                <div>
                                                    <h1 className="text-2xl font-black font-heading text-amber-600 mb-1 uppercase tracking-tight">Assessment — {assessQuestionCount} Questions</h1>
                                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Source: {assessFile?.name || 'Upload'} • {assessLanguage} Medium</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">PaathSohayok AI</p>
                                                    <p className="text-[10px] text-gray-300 font-bold">{new Date().toLocaleDateString('en-IN')}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50/50 p-8 rounded-3xl border border-gray-100 font-medium leading-8">
                                            {assessResult}
                                        </div>
                                    </div>

                                    <div className="text-center pt-16 no-print border-t border-gray-100">
                                        <button
                                            onClick={() => { setAssessResult(null); setAssessFile(null); if(assessFileRef.current) assessFileRef.current.value=''; }}
                                            className="text-gray-400 font-black hover:text-pm-green flex items-center gap-3 mx-auto transition-colors group"
                                        >
                                            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                            <span className="text-sm uppercase tracking-widest">New Assessment</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[450px] flex flex-col items-center justify-center text-center p-12 pm-card border-dashed border-gray-200 bg-gray-50/30 rounded-[2.5rem] transition-all hover:bg-white hover:border-amber-200">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-amber-900/5 mb-8 border border-gray-100">
                                        <FileQuestion className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-2xl font-black font-heading text-gray-400 leading-tight">Assessment Workspace Ready</h3>
                                    <p className="text-gray-400 text-sm mt-4 max-w-sm font-medium leading-relaxed">
                                        Upload an image or PDF above, set the number of questions, and click "Generate Assessment" to create targeted questions.
                                    </p>
                                </div>
                            )}
                        </div>
                        </>
                    )}

                    {activeTab === 'settings' && (
                        <div className="pm-card p-20 text-center bg-white border-gray-100 no-print">
                            <Settings className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold font-heading text-gray-800">Account Preferences</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-2 leading-relaxed">Customize your teaching defaults and security settings here. Features coming soon in next update.</p>
                        </div>
                    )}
                </>
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
                  <div className="absolute top-0 right-0 w-32 h-32 bg-pm-green/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              </div>

              <div className="space-y-16">
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
