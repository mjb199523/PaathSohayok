import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FileText, Presentation, ClipboardList, CheckCircle, GraduationCap, ArrowRight, Library, Target, Award, Mail, MessageCircle, ExternalLink, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const LandingPage = () => {
  const [recentArticles, setRecentArticles] = useState([]);

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
        <title>PaathSohayok – AI Learning Content Generator for Teachers</title>
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
                    Generate lesson plans, PPT slides, assessments, and classroom activities instantly in English and Assamese.
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

            <div className="grid md:grid-cols-3 gap-8">
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
                    icon={<Presentation className="text-pm-green" />} 
                    title="Slide Master" 
                    desc="Receive structured content categorized into slides, ready to be copied into your presentations."
                />
            </div>
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
                        Generate Free 3 High Quality Learning Content to explore our features.
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
                        <span className="text-3xl font-black text-gray-900">₹500</span> / month
                    </p>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">
                        Create up to 100 High Quality Learning Content per month. Contact the admin for more details.
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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentArticles.map((article) => {
                        const slug = `/learn/${(article.class || '').toLowerCase().replace(' ', '-')}/${(article.subject || '').toLowerCase().replace(' ', '-')}/${(article.topic || '').toLowerCase().replace(' ', '-')}`;
                        return (
                            <Link key={article.id} to={slug} className="pm-card p-6 border border-gray-100 hover:border-pm-green/30 transition-standard group flex flex-col h-full bg-white hover:shadow-lg">
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
            </div>
          </section>
      )}

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
