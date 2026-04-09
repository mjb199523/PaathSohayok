import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { API_URL } from '../config';
import { Sparkles, BookOpen, ClipboardList, PenTool, CheckSquare, ChevronRight, Home, ArrowLeft, Loader2, Share2, Printer, Library } from 'lucide-react';

const PublicLessonPage = () => {
    const { grade, subject, topic } = useParams();
    const [lesson, setLesson] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            console.log(`[SEO] Fetching content for: ${grade}/${subject}/${topic}`);
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/public/lesson/${grade}/${subject}/${topic}`);
                
                if (!response.data || response.data.error) {
                    throw new Error('Lesson data empty or invalid');
                }

                setLesson(response.data);
                console.log('[SEO] Lesson data received:', response.data.topic);
                
                // Fetch related (don't block the main lesson if this fails)
                try {
                    const relResponse = await axios.get(`${API_URL}/api/public/related/${grade}/${subject}`);
                    if (relResponse.data && Array.isArray(relResponse.data)) {
                        setRelated(relResponse.data.filter(r => r.id !== response.data.id));
                    }
                } catch (relErr) {
                    console.warn('[SEO] Failed to fetch related lessons:', relErr);
                }
                
                setError(null);
            } catch (err) {
                console.error('[SEO] Fetch error:', err);
                setError('Lesson not found or currently unavailable.');
            } finally {
                setLoading(false);
            }
        };

        if (grade && subject && topic) {
            fetchContent();
        }
        window.scrollTo(0, 0);
    }, [grade, subject, topic]);

    const renderSections = (content) => {
        if (!content) return null;
        const keywordPattern = "(?:LESSON PLAN|CLASSROOM ACTIVITIES|HOMEWORK|ASSESSMENT QUESTIONS|INFORMATION|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|শ্ৰেণীকক্ষৰ কাৰ্যসূচী|গৃহকাৰ্য|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)";
        const splitRegex = new RegExp(`(?=\\n\\s*\\d[.)]\\s*${keywordPattern})`, 'i');
        const Rawsections = content.split(splitRegex).filter(s => s.trim().length > 5);

        return Rawsections.map((section, idx) => {
            const headingMatch = section.match(/^(?:\s*(?:\d[.)]\s*)?)(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|শ্ৰেণীকক্ষৰ কাৰ্যসূচী|গৃহকাৰ্য|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i);
            const rawParsedTitle = headingMatch ? headingMatch[1].trim() : (idx === 0 ? "Overview" : `Section ${idx + 1}`);

            let body = section.replace(/^(?:\s*(?:\d[.)]\s*)?)(Information|Lesson Plan|Classroom Activities|Homework|Assessment Questions|তথ্য|পাঠ পৰিকল্পনা|শ্ৰেণীৰ কাৰ্যকলাপ|শ্ৰেণীকক্ষৰ কাৰ্যসূচী|গৃহকাৰ্য|ঘৰৰ কাম|মূল্যায়নৰ প্ৰশ্ন|মূল্যায়নৰ প্ৰশ্ন)[:\s*#-]*/i, '');
            body = body.replace(/---/g, '').replace(/\*/g, '').replace(/\.\./g, '').trim().replace(/^[\s:)*-]+/, '').replace(/[\s:(*-]+$/, '').trim();

            if (body.length < 5) return null;

            // Only show Information and Lesson Plan on public overview pages
            const tl = rawParsedTitle.toLowerCase();
            const allowedKeywords = ['information', 'lesson plan', 'তথ্য', 'পাঠ পৰিকল্পনা', 'overview'];
            const isAllowed = allowedKeywords.some(kw => tl.includes(kw));
            if (!isAllowed) return null;

            return (
                <section key={idx} className="mb-12 scroll-mt-20">
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3 border-b-4 border-pm-green/10 pb-2">
                        {rawParsedTitle}
                    </h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                        {body}
                    </div>
                </section>
            );
        }).filter(Boolean);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
            <Loader2 className="w-12 h-12 text-pm-green animate-spin mb-4" />
            <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Loading Lesson Material...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] p-6 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-6 border border-rose-100">
                <Sparkles className="w-10 h-10 text-rose-300" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 font-heading">404 - Lesson Not Found</h1>
            <p className="text-gray-500 max-w-sm mb-8">The requested educational material is not available in our public index. Please check the URL or return to home.</p>
            <Link to="/" className="pm-button-primary px-8 py-3">Back to Homepage</Link>
        </div>
    );

    if (!lesson) return null;

    const pageTitle = `${lesson.class} ${lesson.subject} ${lesson.topic} Notes in ${lesson.language} | PaathSohayok`;
    const pageDesc = `Learn ${lesson.topic} chapter for ${lesson.class} ${lesson.subject} in ${lesson.language} medium with explanation, examples, and questions.`;
    const canonicalUrl = `https://www.paathsohayok.in/learn/${grade}/${subject}/${topic}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "headline": pageTitle,
        "description": pageDesc,
        "author": { "@type": "Organization", "name": "PaathSohayok" },
        "url": canonicalUrl,
        "learningResourceType": "Lesson Plan",
        "educationalLevel": lesson.class,
        "inLanguage": lesson.language === 'Assamese' ? 'as' : 'en'
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] font-inter">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="article" />
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            </Helmet>

            {/* Public Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-pm-green rounded-lg flex items-center justify-center text-white shadow-sm group-hover:rotate-6 transition-transform">
                            <Library className="w-5 h-5" />
                        </div>
                        <span className="font-black text-xl font-heading text-gray-900 tracking-tight">PaathSohayok</span>
                    </Link>
                    <Link to="/login?role=teacher" className="text-sm font-bold text-pm-green hover:underline">Teachers Login</Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/" className="hover:text-pm-green flex items-center gap-1"><Home className="w-3 h-3" /> Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-400">{lesson.class}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-400">{lesson.subject}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-pm-green truncate">{lesson.topic}</span>
                </nav>

                {/* Lesson Header */}
                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-green-50 text-pm-green text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                            {lesson.language} Medium
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(lesson.created_at).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6 font-heading">
                        {lesson.topic} ({lesson.class} {lesson.subject}) | PaathSohayok
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                        {pageDesc}
                    </p>
                </header>

                {/* Content Panel */}
                <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-xl shadow-green-900/[0.03] border border-gray-100 mb-16 ring-1 ring-gray-100/50">
                    {renderSections(lesson.content)}
                </div>

                {/* Internal Linking: Related Lessons */}
                {related.length > 0 && (
                    <section className="mb-20 pt-16 border-t border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900 mb-6 font-heading">Related Lessons:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-lg text-pm-green font-medium">
                            {related.map(rel => {
                                const internalPath = `/learn/${rel.class.toLowerCase().replace(' ', '-')}/${rel.subject.toLowerCase().replace(' ', '-')}/${rel.topic.toLowerCase().replace(' ', '-')}`;
                                return (
                                    <li key={rel.id}>
                                        <Link to={internalPath} className="hover:underline">
                                            {internalPath}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}

                {/* Footer Call to Action */}
                <section className="bg-pm-green p-12 rounded-[2.5rem] text-center text-white shadow-2xl shadow-green-900/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-80" />
                        <h3 className="text-3xl font-black mb-4 font-heading">Are you a teacher?</h3>
                        <p className="max-w-md mx-auto mb-8 font-medium text-white/80">Generate your own unique lesson plans, MCQs, and worksheets in minutes with our AI Content Studio.</p>
                        <Link to="/login?role=teacher" className="bg-white text-pm-green px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all inline-block shadow-lg">Start Generating Free</Link>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                </section>
            </main>
        </div>
    );
};

export default PublicLessonPage;
