import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Presentation, ClipboardList, CheckCircle, GraduationCap, ArrowRight, Library, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  useEffect(() => {
    document.title = "Home | PaathSohayok";
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-inter">
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
              <p className="text-sm text-gray-400">© 2026 PaathSohayok (পাঠসহায়ক). Empowering education in Assam.</p>
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
