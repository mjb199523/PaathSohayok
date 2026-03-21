import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Library, XCircle, ChevronDown, UserCheck, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramRole = queryParams.get('role');
  const storedRole = localStorage.getItem('pm_last_role');
  
  const initialRole = paramRole === 'admin' || (paramRole !== 'teacher' && storedRole === 'admin') ? 'admin' : 'teacher';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiURL}/api/auth/login`, {
        email,
        password,
        role
      });

      const { token, user } = response.data;
      localStorage.setItem('pm_token', token);
      localStorage.setItem('pm_last_role', user.role);
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please contact your Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-inter overflow-hidden">
      {/* Brand Logo Above Card */}
      <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2E7D32] rounded-xl flex items-center justify-center text-white shadow-sm">
              <Library className="w-6 h-6 border-none" />
          </div>
          <div className="flex flex-col">
              <h2 className="text-2xl font-bold font-heading text-[#111827] leading-none">PaathSohayok</h2>
              <span className="text-[10px] font-bold text-pm-green tracking-[0.2em] uppercase mt-1">পাঠসহায়ক</span>
          </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className={`pm-card ${error ? 'p-8' : 'p-10'} shadow-medium border-gray-100 transition-all duration-300`}>
            <div className={`${error ? 'mb-6' : 'mb-10'} text-center transition-all duration-300`}>
                <h3 className="text-2xl font-bold text-gray-900 font-heading">Sign in to your account</h3>
                <p className="text-gray-500 mt-2 text-sm tracking-tight capitalize">Enter your details to access the platform</p>
            </div>

            {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center gap-3 animate-shake">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className={error ? 'space-y-4' : 'space-y-6'}>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Login Role</label>
                    <div className="relative">
                        <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                            className="pm-input pl-11 appearance-none bg-gray-50/50"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="teacher">Teacher</option>
                            <option value="admin">Administrator</option>
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2E7D32] transition-colors" />
                        <input 
                            required
                            type="email" 
                            placeholder="e.g. name@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pm-input pl-11"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#2E7D32] transition-colors" />
                        <input 
                            required
                            type="password" 
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pm-input pl-11"
                        />
                    </div>
                </div>

                <div className="pt-2 flex flex-col items-center gap-4">
                    <button 
                        disabled={loading}
                        className="pm-button-primary w-full py-3.5 flex items-center justify-center gap-2 group shadow-green-900/10 shadow-lg"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                <span className="text-base text-lg font-bold">Sign In</span>
                            </>
                        )}
                    </button>
                    
                    <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-[#2E7D32] flex items-center gap-2 transition-colors mt-2">
                        <ArrowLeft className="w-4 h-4" />
                        Click here to go back to landing page
                    </Link>
                </div>
            </form>

            <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-xs text-center text-gray-400 leading-relaxed font-semibold">
                    Unauthorized access is prohibited. All activity is logged. <br />
                    Developed by Manashjyoti Barman
                </p>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
