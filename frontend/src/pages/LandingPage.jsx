import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Presentation, ClipboardList, CheckCircle, GraduationCap, ArrowRight, Library, Target, Award, Mail, MessageCircle, ExternalLink, BookOpen, ChevronLeft, ChevronRight, FileQuestion, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const VIDEOS = [
  {
    id: 'B5a4mFVWyY0',
    badge: '🎓 Tutorial',
    heading: 'How to Use PaathSohayok',
    subtitle: 'A step-by-step guide on using PaathSohayok to generate lesson plans, assessments, and slides in minutes.',
    label: 'How to Use PaathSohayok',
  },
  {
    id: 'hh7dfSezZNs',
    badge: '📖 Introduction',
    heading: 'What is PaathSohayok?',
    subtitle: 'Learn how PaathSohayok helps teachers in Assam generate lesson plans, assessments, and classroom content using AI.',
    label: 'What is PaathSohayok',
  },
];

const BLOG_POSTS = [
  {
    id: 1,
    title: "AI for Teachers in Assam: Save 5+ Hours Every Week",
    description: "Learn how AI automates lesson planning and assessments, saving valuable time.",
    link: "/blog/blog1.html",
    date: "19 Apr 2026",
    category: "AI & Education",
    readTime: "3 min read"
  },
  {
    id: 2,
    title: "How to Create Lesson Plans in Minutes Using AI",
    description: "Step-by-step guide to generating lesson plans instantly.",
    link: "/blog/blog2.html",
    date: "18 Apr 2026",
    category: "Tutorial",
    readTime: "2 min read"
  },
  {
    id: 3,
    title: "Convert PDF to Question Paper Instantly (Step-by-Step)",
    description: "Create AI-generated assessments directly from any PDF.",
    link: "/blog/blog3.html",
    date: "17 Apr 2026",
    category: "Assessments",
    readTime: "4 min read"
  },
  {
    id: 4,
    title: "Best Tools for Teachers in Assam (2026 Guide)",
    description: "Top essential digital tools for educators for efficient teaching.",
    link: "/blog/blog4.html",
    date: "16 Apr 2026",
    category: "Resources",
    readTime: "5 min read"
  },
  {
    id: 5,
    title: "How to Generate Assessments Automatically Using AI",
    description: "Quick and easy assessment creation for focused testing.",
    link: "/blog/blog5.html",
    date: "15 Apr 2026",
    category: "Tutorial",
    readTime: "3 min read"
  }
];

const LandingPage = () => {
  const [recentArticles, setRecentArticles] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [playingVideos, setPlayingVideos] = useState({});
  const carouselRef = useRef(null);
  const blogCarouselRef = useRef(null);

  const activeVideo = VIDEOS[activeVideoIndex];
  const isVideoPlaying = !!playingVideos[activeVideo.id];

  const handlePlayVideo = useCallback(() => {
    setPlayingVideos(prev => ({ ...prev, [VIDEOS[activeVideoIndex].id]: true }));
  }, [activeVideoIndex]);

  const handleVideoSwitch = useCallback((index) => {
    setActiveVideoIndex(index);
  }, []);

  const scrollCarousel = (direction) => {
      if (!carouselRef.current) return;
      const scrollAmount = 360;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const scrollBlogCarousel = (direction) => {
      if (!blogCarouselRef.current) return;
      const scrollAmount = 360;
      blogCarouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  useEffect(() => {
      const fetchRecent = async () => {
          try {
              const res = await axios.get(`${API_URL}/api/public/recent`);
              setRecentArticles(res.data);
          } catch (err) {
              console.error('Failed to fetch recent articles');
          }
      };
      fetchRecent();
  }, []);
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
      <Helmet>
        <title>PaathSohayok – AI Tool for Teachers in Assam | Lesson Plans & Assessments</title>
      </Helmet>
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-pm-green rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Library className="w-5 h-5" />
                </div>
                <div>
                   <h1 className="text-xl font-bold text-pm-900 tracking-tight font-heading">PaathSohayok</h1>
                   <span className="text-[10px] block -mt-1 font-semibold text-pm-green tracking-widest uppercase">{"\u09AA\u09BE\u09A0\u09B8\u09B9\u09BE\u09DF\u0995"}</span>
                </div>
            </div>
            <div className="hidden md:flex gap-4">
                 <Link to="/login?role=admin" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-pm-green transition-colors">Admin Login</Link>
                 <Link to="/login?role=teacher" className="px-5 py-2 text-sm font-bold bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-shadow shadow-sm">Teacher Login</Link>
            </div>
            <div className="md:hidden">
                 <Link to="/login?role=teacher" className="p-2 text-gray-500 hover:text-pm-green"><Library className="w-6 h-6" /></Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
            >
                <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-pm-green text-xs font-bold border border-green-100 mb-6">
                    ✨ AI-Powered Teacher Support System
                </span>
                <h2 className="text-5xl md:text-7xl font-bold font-heading text-pm-900 leading-[1.1] mb-8 max-w-4xl mx-auto">
                    Transform your <span className="text-pm-green underline decoration-green-100 underline-offset-8">lesson planning</span> with intelligent AI.
                </h2>
                <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Generate lesson plans, homework, and classroom activities in Assamese and English - export as structured PDFs and create assessments from images or PDFs in under 2 minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/login?role=teacher" className="pm-button-primary px-10 py-4 flex items-center gap-3 text-base group">
                        Start Generating for Free
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a 
                        href="/sample_material.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="pm-button-secondary px-10 py-4 text-base flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 border border-[#E5E7EB] rounded-lg font-semibold"
                    >
                        View Sample Materials
                    </a>
                </div>
            </motion.div>
        </div>

        {/* Subtle decorative background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50/50 rounded-full blur-[120px] -z-0 opacity-50"></div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 px-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold font-heading mb-4">Why choose PaathSohayok (পাঠসহায়ক)?</h3>
                  <p className="text-gray-500">The first AI platform tailored specifically for teachers in Assam.</p>
             </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard 
                    icon={<Award className="text-pm-green" />} 
                    title="Bilingual Efficiency" 
                    desc="Switch effortlessly between English and Assamese for all your document generation needs."
                />
                <FeatureCard 
                    icon={<Target className="text-pm-green" />} 
                    title="Curriculum Focused" 
                    desc="Generate content that aligns perfectly with state and central educational standards for grades 1-12."
                />
                <FeatureCard 
                    icon={<FileQuestion className="text-pm-green" />} 
                    title="Assessment Generator" 
                    desc="Upload any PDF or image and instantly generate targeted assessment questions with answer keys from its content."
                />
                <FeatureCard 
                    icon={<Presentation className="text-pm-green" />} 
                    title="Slide Master" 
                    desc="Receive structured content categorized into slides, ready to be copied into your presentations."
                />
            </div>
        </div>
      </section>

      {/* Video Section with Slider */}
      <section id="about-video" className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-gray-50/80 via-white to-white">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-50/40 rounded-full blur-[100px] -z-0 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header — dynamic based on active video */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 text-pm-green text-xs font-bold border border-green-100 mb-5">
              {activeVideo.badge}
            </span>
            <h3 className="text-3xl md:text-4xl font-bold font-heading mb-4">{activeVideo.heading}</h3>
            <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
              {activeVideo.subtitle}
            </p>
          </div>

          {/* Video Tab Selectors */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 w-full px-4">
            {VIDEOS.map((video, index) => (
              <button
                key={video.id}
                onClick={() => handleVideoSwitch(index)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeVideoIndex === index
                    ? 'bg-pm-green text-white shadow-lg shadow-green-200/50'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-pm-green/40 hover:text-pm-green'
                }`}
              >
                {video.heading}
              </button>
            ))}
          </div>


          {/* Video Embed Container with Navigation Arrows */}
          <div className="relative group/video">
            {/* Left Arrow */}
            {activeVideoIndex > 0 && (
              <button
                onClick={() => handleVideoSwitch(activeVideoIndex - 1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-pm-green hover:border-pm-green/40 transition-all -ml-5 opacity-0 group-hover/video:opacity-100"
                aria-label="Previous video"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <motion.div
              key={activeVideo.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-200/60 bg-gray-900 aspect-video"
            >
              {!isVideoPlaying ? (
                /* Thumbnail + Play Overlay */
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 w-full h-full cursor-pointer group z-10"
                  aria-label={`Play ${activeVideo.label} video`}
                >
                  {/* YouTube Thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${activeVideo.id}/sddefault.jpg`}
                    alt={`${activeVideo.label} - AI tool for teachers in Assam`}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.target.src = `https://img.youtube.com/vi/${activeVideo.id}/hqdefault.jpg`; }}
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/50 group-hover:via-black/10 transition-all duration-300"></div>
                  
                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white/95 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-white transition-all duration-300">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-pm-green fill-pm-green ml-1" />
                    </div>
                  </div>

                  {/* Bottom label */}
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white/90 text-sm font-semibold">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    {activeVideo.label}
                  </div>
                </button>
              ) : (
                /* Lazy-loaded YouTube iframe */
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${activeVideo.label} - AI tool for teachers in Assam`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                ></iframe>
              )}
            </motion.div>

            {/* Right Arrow */}
            {activeVideoIndex < VIDEOS.length - 1 && (
              <button
                onClick={() => handleVideoSwitch(activeVideoIndex + 1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-pm-green hover:border-pm-green/40 transition-all -mr-5 opacity-0 group-hover/video:opacity-100"
                aria-label="Next video"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Slider Dots */}
          <div className="flex justify-center gap-2.5 mt-6">
            {VIDEOS.map((video, index) => (
              <button
                key={video.id}
                onClick={() => handleVideoSwitch(index)}
                className={`rounded-full transition-all duration-300 ${
                  activeVideoIndex === index
                    ? 'w-8 h-2.5 bg-pm-green'
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Switch to ${video.heading}`}
              />
            ))}
          </div>

          {/* SEO Content Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-14 max-w-3xl mx-auto text-center"
          >
            <h4 className="text-2xl font-bold font-heading mb-4 text-gray-900">
              AI-Powered Teaching Assistant for Assam
            </h4>
            <p className="text-gray-500 leading-relaxed text-base">
              PaathSohayok is designed specifically for educators in Assam, enabling them to
              create curriculum-aligned lesson plans, generate assessments from PDFs,
              and produce presentation-ready slides instantly. With bilingual support in
              Assamese and English, it simplifies teaching workflows and enhances
              classroom productivity.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-green-50 text-pm-green rounded-full text-xs font-bold border border-green-100">📚 Lesson Plans</span>
              <span className="px-4 py-2 bg-green-50 text-pm-green rounded-full text-xs font-bold border border-green-100">📝 Assessments</span>
              <span className="px-4 py-2 bg-green-50 text-pm-green rounded-full text-xs font-bold border border-green-100">📊 Slides</span>
              <span className="px-4 py-2 bg-green-50 text-pm-green rounded-full text-xs font-bold border border-green-100">🌐 Bilingual</span>
              <span className="px-4 py-2 bg-green-50 text-pm-green rounded-full text-xs font-bold border border-green-100">⚡ Under 2 min</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50/50 py-24 px-6">
        <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold font-heading mb-4">Choose Your Plan</h3>
                  <p className="text-gray-500">Simple pricing for high-quality educational content generation.</p>
             </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Basic Plan */}
                <div className="pm-card p-10 bg-white border border-gray-100 flex flex-col items-center text-center transition-standard hover:shadow-medium">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                        <GraduationCap className="w-8 h-8 text-pm-green" />
                    </div>
                    <h4 className="text-2xl font-bold font-heading mb-2">Basic Package</h4>
                    <p className="text-gray-400 font-bold mb-6 tracking-widest uppercase text-xs">Best for Trials</p>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                        Generate Free 3 High Quality Learning Content or assessment by just uploading an image or PDF to explore our features.
                    </p>
                    <div className="mt-auto w-full text-center">
                        <Link to="/login?role=teacher" className="inline-block w-full py-3.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all text-center">
                            Get Started
                        </Link>
                        <p className="mt-2.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Contact us to get started</p>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="pm-card p-10 bg-white border-2 border-pm-green ring-8 ring-green-50 flex flex-col items-center text-center relative transition-standard hover:shadow-xl">
                    <div className="absolute top-4 right-4 bg-pm-green text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        Popular
                    </div>
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-6">
                        <CheckCircle className="w-8 h-8 text-pm-green" />
                    </div>
                    <h4 className="text-2xl font-bold font-heading mb-2">Premium Package</h4>
                    <p className="text-pm-green font-bold mb-6 tracking-widest uppercase text-xs">For Dedicated Educators</p>
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                        <span className="text-3xl font-black text-gray-900">₹200</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                        Generate upto 50 High Quality Learning Content or assessment by just uploading an image or PDF to explore our features.
                    </p>
                    <div className="mt-auto w-full text-center">
                        <a 
                            href="https://wa.me/918753912572?text=Hello,%20I%20am%20interested%20in%20PaathSohayok%20Premium%20Package" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-3 w-full py-3.5 bg-pm-green text-white rounded-lg font-bold hover:bg-green-700 transition-all text-center"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Contact on WhatsApp
                        </a>
                        <p className="mt-2.5 text-[10px] invisible">Placeholder</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Created Articles Section (SEO) */}
      {recentArticles.length > 0 && (
          <section className="bg-white py-24 px-6 border-b border-gray-100">
            <div className="max-w-7xl mx-auto">
                 <div className="text-center mb-16">
                      <h3 className="text-3xl font-bold font-heading mb-4">Explore Created Articles</h3>
                      <p className="text-gray-500">Discover engaging educational content generated by our educator community.</p>
                 </div>

                <div className="relative group/carousel">
                    {/* Left Arrow */}
                    <button onClick={() => scrollCarousel('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-pm-green hover:border-pm-green/40 transition-all -ml-5 opacity-0 group-hover/carousel:opacity-100">
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div ref={carouselRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 lg:mx-0 lg:px-0">
                        {recentArticles.map((article) => {
                            const slug = `/learn/${(article.class || '').toLowerCase().replace(' ', '-')}/${(article.subject || '').toLowerCase().replace(' ', '-')}/${(article.topic || '').toLowerCase().replace(' ', '-')}`;
                            return (
                                <Link key={article.id} to={slug} className="snap-start shrink-0 w-[85vw] md:w-[340px] pm-card p-6 border border-gray-100 hover:border-pm-green/30 transition-standard group flex flex-col bg-white hover:shadow-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2.5 py-1 bg-green-50 text-pm-green rounded-lg text-[10px] font-black uppercase tracking-widest">{article.class}</span>
                                            <span className="text-xs text-gray-400 font-bold">•</span>
                                            <span className="text-xs text-gray-500 font-semibold">{article.language}</span>
                                        </div>
                                        <h4 className="text-xl font-bold font-heading text-gray-900 group-hover:text-pm-green transition-colors mb-2 line-clamp-2">{article.topic}</h4>
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />{article.subject}</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center text-sm font-bold text-gray-400">
                                        <span>{new Date(article.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        <span className="flex items-center gap-1 text-pm-green group-hover:translate-x-1 transition-transform">Read Lesson <ExternalLink className="w-4 h-4" /></span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right Arrow */}
                    <button onClick={() => scrollCarousel('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-pm-green hover:border-pm-green/40 transition-all -mr-5 opacity-0 group-hover/carousel:opacity-100">
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Fade Edges */}
                    <div className="pointer-events-none absolute top-0 bottom-8 left-0 w-16 bg-gradient-to-r from-white to-transparent hidden lg:block z-10"></div>
                    <div className="pointer-events-none absolute top-0 bottom-8 right-0 w-16 bg-gradient-to-l from-white to-transparent hidden lg:block z-10"></div>
                </div>
            </div>
          </section>
      )}

      {/* Blogs Section (SEO) */}
      <section className="bg-gray-50/50 py-24 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold font-heading mb-4">Latest Insights & Resources</h3>
                  <p className="text-gray-500">Discover tips, tools, and guides to enhance your teaching experience with AI.</p>
             </div>

            <div className="relative group/blogcarousel">
                {/* Left Arrow */}
                <button onClick={() => scrollBlogCarousel('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-pm-green hover:border-pm-green/40 transition-all -ml-5 opacity-0 group-hover/blogcarousel:opacity-100">
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div ref={blogCarouselRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 lg:mx-0 lg:px-0">
                    {BLOG_POSTS.map((post) => (
                        <a key={post.id} href={post.link} className="snap-start shrink-0 w-[85vw] md:w-[340px] pm-card p-6 border border-gray-100 hover:border-pm-green/30 transition-standard group flex flex-col bg-white hover:shadow-lg">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2.5 py-1 bg-green-50 text-pm-green rounded-lg text-[10px] font-black uppercase tracking-widest">{post.category}</span>
                                    <span className="text-xs text-gray-400 font-bold">•</span>
                                    <span className="text-xs text-gray-500 font-semibold">{post.readTime}</span>
                                </div>
                                <h4 className="text-xl font-bold font-heading text-gray-900 group-hover:text-pm-green transition-colors mb-3 line-clamp-2">{post.title}</h4>
                                <p className="text-sm font-medium text-gray-500 line-clamp-3 mb-4 leading-relaxed">{post.description}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center text-sm font-bold text-gray-400">
                                <span>{post.date}</span>
                                <span className="flex items-center gap-1 text-pm-green group-hover:translate-x-1 transition-transform">Read Article <ExternalLink className="w-4 h-4" /></span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Right Arrow */}
                <button onClick={() => scrollBlogCarousel('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-pm-green hover:border-pm-green/40 transition-all -mr-5 opacity-0 group-hover/blogcarousel:opacity-100">
                    <ChevronRight className="w-5 h-5" />
                </button>

                {/* Fade Edges */}
                <div className="pointer-events-none absolute top-0 bottom-8 left-0 w-16 bg-gradient-to-r from-gray-50/50 to-transparent hidden lg:block z-10"></div>
                <div className="pointer-events-none absolute top-0 bottom-8 right-0 w-16 bg-gradient-to-l from-gray-50/50 to-transparent hidden lg:block z-10"></div>
            </div>
            
            <div className="mt-8 text-center">
                 <a href="/blog/index.html" className="inline-flex items-center gap-2 text-pm-green font-bold hover:underline">
                      View All Blogs <ArrowRight className="w-4 h-4" />
                 </a>
            </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="bg-white py-24 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold font-heading mb-4">Contact Us</h3>
                  <p className="text-gray-500">Have questions? We're here to help you succeed.</p>
             </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-pm-green/20">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-pm-green">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                        <a href="mailto:paathsohayok@gmail.com" className="text-lg font-bold text-gray-900 hover:text-pm-green transition-colors">paathsohayok@gmail.com</a>
                    </div>
                </div>

                <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:border-pm-green/20">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-pm-green">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Call / WhatsApp</p>
                        <a href="https://wa.me/918753912572" target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-gray-900 hover:text-pm-green transition-colors">+91 87539 12572</a>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-pm-gray-50 text-center">
          <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center gap-4 mb-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pm-green rounded-lg flex items-center justify-center text-white">
                            <Library className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-base font-heading text-gray-900 leading-none">PaathSohayok</span>
                            <span className="text-[9px] font-bold text-pm-green tracking-widest uppercase mt-0.5">পাঠসহায়ক</span>
                        </div>
                    </div>
              </div>
              <p className="text-sm text-gray-400">© 2026 PaathSohayok (পাঠসহায়ক). Empowering education in Assam and other parts of India.</p>
          </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="pm-card p-8 transition-standard hover:border-pm-green/30 hover:shadow-medium group">
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-green-50 transition-colors">
            {icon}
        </div>
        <h4 className="text-xl font-bold font-heading mb-3">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed leading-7">{desc}</p>
    </div>
);

export default LandingPage;
