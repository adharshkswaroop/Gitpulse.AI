import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Terminal, Github, User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginProps {
    onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBack }) => {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('auth/unauthorized-domain')) {
                setError('Domain not authorized. Add "localhost" to Firebase Console.');
            } else {
                setError('Failed to sign in: ' + (err.message || 'Unknown error'));
            }
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
        } catch (err: any) {
            console.error(err);
            if (err.message && err.message.includes('auth/unauthorized-domain')) {
                setError('Domain not authorized.');
            } else {
                setError(err.message.replace('Firebase: ', ''));
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans bg-[#050505] text-slate-50 overflow-hidden relative">

            {/* --- Animated Background Elements --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00e673]/5 blur-[100px] rounded-full mix-blend-screen animate-pulse duration-[5000ms]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* --- Left Panel (Form) --- */}
            <div className="flex flex-col justify-center flex-1 px-8 py-12 relative z-10 lg:flex-none lg:w-1/2 xl:w-[500px] 2xl:w-[600px] border-r border-slate-800/50 bg-[#050505]/80 backdrop-blur-sm">

                {onBack && (
                    <button onClick={onBack} className="absolute top-8 left-8 text-sm text-slate-400 hover:text-[#00e673] flex items-center gap-2 transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
                    </button>
                )}

                <div className="w-full max-w-sm mx-auto">

                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#00e673] to-emerald-600 rounded-xl flex items-center justify-center text-black shadow-lg shadow-[#00e673]/20">
                            <Terminal size={20} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-2xl tracking-tight">GitPulse.ai</span>
                    </div>

                    <div className="mb-8">
                        <motion.h1
                            key={isLogin ? 'login-h1' : 'signup-h1'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold tracking-tight mb-2"
                        >
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </motion.h1>
                        <motion.p
                            key={isLogin ? 'login-p' : 'signup-p'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400"
                        >
                            {isLogin ? 'Enter your details to access your workspace.' : 'Start your AI research journey today.'}
                        </motion.p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login-form' : 'signup-form'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {error && (
                                <div className="p-3 mb-6 text-sm text-red-200 bg-red-900/20 rounded-lg border border-red-900/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" /> {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-4">
                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00e673] transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-slate-700/50 rounded-xl focus:bg-[#0d1117] focus:ring-2 focus:ring-[#00e673]/50 focus:border-[#00e673] transition-all outline-none text-sm text-white placeholder:text-slate-600 shadow-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00e673] transition-colors" size={18} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                className="w-full pl-10 pr-4 py-3 bg-[#161b22] border border-slate-700/50 rounded-xl focus:bg-[#0d1117] focus:ring-2 focus:ring-[#00e673]/50 focus:border-[#00e673] transition-all outline-none text-sm text-white placeholder:text-slate-600 shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00e673] transition-colors" size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-10 py-3 bg-[#161b22] border border-slate-700/50 rounded-xl focus:bg-[#0d1117] focus:ring-2 focus:ring-[#00e673]/50 focus:border-[#00e673] transition-all outline-none text-sm text-white placeholder:text-slate-600 shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-[#00e673] text-black rounded-xl font-bold text-sm hover:bg-[#00d66c] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#00e673]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Sign In' : 'Create Account')}
                                </button>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-wider">
                            <span className="px-4 text-slate-500 bg-[#050505]">or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#161b22] border border-slate-700/50 rounded-xl font-bold text-sm text-slate-200 hover:bg-[#1c2128] hover:border-slate-600 transition-all group shadow-sm disabled:opacity-70"
                    >
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.16-3.16C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-sm mt-8">
                        <span className="text-slate-500">{isLogin ? "New to GitPulse?" : "Already member?"}</span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-bold text-[#00e673] hover:text-emerald-400 hover:underline transition-colors"
                        >
                            {isLogin ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Right Panel (Visuals) --- */}
            <div className="hidden lg:flex flex-1 relative bg-black overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,230,115,0.05),transparent_70%)]"></div>

                {/* 3D Grid Floor */}
                <div className="absolute bottom-0 left-[-50%] right-[-50%] h-[500px] bg-[linear-gradient(transparent_0%,rgba(0,230,115,0.1)_100%)] [mask-image:linear-gradient(to_bottom,transparent,black)] transform perspective-[1000px] rotate-x-60">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] animate-[slide-up_20s_linear_infinite]"></div>
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-md space-y-8"
                    >
                        <div className="relative w-48 h-48 mx-auto">
                            {/* Rotating Rings */}
                            <div className="absolute inset-0 border-2 border-[#00e673]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                            <div className="absolute inset-4 border-2 border-dashed border-[#00e673]/30 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                            <div className="absolute inset-12 border border-[#00e673]/50 rounded-full animate-pulse"></div>

                            {/* Center Logo */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={48} className="text-[#00e673] filter drop-shadow-[0_0_15px_rgba(0,230,115,0.5)]" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tighter text-white">
                                Research at <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e673] to-emerald-400">Light Speed</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Join thousands of engineers building better software with AI-powered repository intelligence.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
