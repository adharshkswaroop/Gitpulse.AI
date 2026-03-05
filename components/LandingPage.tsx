import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowRight,
    Terminal,
    Search,
    ShieldCheck,
    Users,
    Zap,
    Database,
    Code2,
    CheckCircle,
    Github,
    Menu,
    X,
    Sparkles,
    GitBranch,
    Cpu,
    Globe,
    Check,
    Rocket,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';

// --- Types for Props ---
interface LandingPageProps {
    onLoginClick: () => void;
    onStartFreeClick: () => void;
}

// --- Sub-components ---

const TypingEffect = ({ text, delay = 0 }: { text: string, delay?: number }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const animate = async () => {
            await new Promise(r => setTimeout(r, delay));
            for (let i = 0; i <= text.length; i++) {
                setDisplayedText(text.slice(0, i));
                await new Promise(r => setTimeout(r, 50 + Math.random() * 30));
            }
        };
        animate();
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return <span>{displayedText}<span className="animate-pulse">|</span></span>;
};

const SpotlightCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`group relative border border-slate-800 bg-slate-900/50 overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            {...props}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 230, 115, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
};

const LiveTerminal = () => {
    const [lines, setLines] = useState<string[]>([
        "> gitpulse init --mode=deep_research",
        "  Initializing vector database...",
        "  Connecting to GitHub API...",
        "  Target: 'High performance Rust networking'",
        "  Found 12,403 repositories...",
        "> gitpulse analyze --filter=license:mit",
        "  Filtering candidates...",
        "  Applying semantic ranking...",
        "  SUCCESS: 3 top-tier candidates found."
    ]);

    return (
        <div className="w-full max-w-lg mx-auto bg-[#0d1117] rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs md:text-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-[#161b22]">
                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                <div className="text-slate-500 ml-2">terminal — zsh</div>
            </div>
            <div className="p-4 space-y-2 h-[200px] overflow-hidden relative">
                {lines.map((line, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.8 }}
                        className={line.startsWith(">") ? "text-[#00e673] font-bold" : "text-slate-400"}
                    >
                        {line}
                    </motion.div>
                ))}
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0d1117] to-transparent"></div>
            </div>
        </div>
    );
};

/* --- Main Component --- */
const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onStartFreeClick }) => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-[#00e673] selection:text-black">

            {/* --- Animated Background --- */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00e673]/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
            </div>

            {/* --- Navbar --- */}
            <nav className="fixed top-0 left-0 right-0 z-[100] w-full backdrop-blur-xl bg-[#050505]/60 border-b border-white/5 transition-all supports-[backdrop-filter]:bg-[#050505]/40">
                <div className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-[#00e673] rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,230,115,0.3)]">
                            <Terminal size={20} strokeWidth={3} />
                        </div>
                        <span className="font-bold text-xl tracking-tighter">GitPulse.<span className="text-[#00e673]">AI</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">How it works</button>
                        <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Features</button>
                        <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Pricing</button>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onLoginClick} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign in</button>
                        <button onClick={onStartFreeClick} className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 hidden sm:block">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <main className="relative z-10 container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-16">

                {/* Text Content */}
                <div className="flex-1 text-center md:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-[#00e673] mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e673] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e673]"></span>
                        </span>
                        v2.0 Now Available
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-6">
                        AI-powered Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e673] via-emerald-400 to-blue-500">
                            GitHub Repo Buddy.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        A Quick start for your project. Find precision-filtered signal for your side-hustle, academic research, or production workloads. Zero noise.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-20">
                        <button onClick={onStartFreeClick} className="w-full sm:w-auto px-8 py-4 bg-[#00e673] text-black font-bold rounded-full hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_-5px_rgba(0,230,115,0.5)]">
                            <Sparkles size={18} /> Start Free Research
                        </button>
                    </div>
                </div>

                {/* Live Terminal Demo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 2 }}
                    className="mt-20 w-full max-w-4xl relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00e673] via-cyan-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>

                    <div className="relative bg-[#0d1117]/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-slate-800/60">
                            <div className="flex gap-2 mr-4">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="text-xs font-mono text-slate-500 flex-1 text-center">gitpulse-agent — v2.4.0 — ⚡ active</div>
                        </div>
                        <div className="p-6 text-left h-64 md:h-80 overflow-hidden bg-black/50">
                            <LiveTerminal />
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* --- Features Grid (Spotlight) --- */}
            <section id="features" className="py-24 px-6 relative overflow-hidden bg-[#0a0a0c]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to <span className="text-[#00e673]">ship.</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Premium tools for the modern software engineer.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: <Search className="text-[#00e673]" />, title: "Semantic Search", desc: "Understand context, not just keywords. Find 'auth' even if you type 'login'." },
                            { icon: <ShieldCheck className="text-cyan-400" />, title: "Trust Scores", desc: "Proprietary algorithm that evaluates maintenance, issues, and community health." },
                            { icon: <Database className="text-purple-400" />, title: "License Filtering", desc: "Corporate-safe search. Exclude GPL or non-commercial licenses automatically." },
                            { icon: <Users className="text-yellow-400" />, title: "Team Stacks", desc: "Curate and share technology stacks with your engineering team." },
                            { icon: <Terminal className="text-red-400" />, title: "CLI First", desc: "Integrate directly into your workflow. No context switching required." },
                            { icon: <Zap className="text-blue-400" />, title: "Zero Dependencies", desc: "Filter for lightweight libraries with zero or minimal dependencies." }
                        ].map((feature, idx) => (
                            <SpotlightCard key={idx} className="rounded-2xl p-8 hover:-translate-y-1 transition-transform duration-300">
                                <div className="mb-6 w-12 h-12 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- How It Works Section --- */}
            <section id="how-it-works" className="py-24 px-6 relative bg-[#050505]">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black tracking-tight mb-6"
                    >
                        How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e673] to-emerald-400">Magic</span> Happens
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-400 leading-relaxed"
                    >
                        GitPulse transforms how you discover software by combining semantic understanding with real-time repository intelligence.
                    </motion.p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00e673]/30 to-transparent -translate-y-1/2 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#0d1117]/80 backdrop-blur-md rounded-3xl p-8 border border-slate-800/50 hover:border-[#00e673]/30 transition-all group text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform shadow-lg shadow-[#00e673]/5">
                                <GitBranch className="text-[#00e673]" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">1. Connect Context</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                You define your stack, constraints, and goals. We analyze your requirements using advanced LLMs to understand <i>intent</i>, not just keywords.
                            </p>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#0d1117]/80 backdrop-blur-md rounded-3xl p-8 border border-slate-800/50 hover:border-blue-500/30 transition-all group text-center relative"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/5">
                                <Cpu className="text-blue-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">2. Deep Analysis</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Our engine scans millions of repositories, filtering by license, activity, and code quality using our proprietary "Pulse Score".
                            </p>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#0d1117]/80 backdrop-blur-md rounded-3xl p-8 border border-slate-800/50 hover:border-purple-500/30 transition-all group text-center"
                        >
                            <div className="w-16 h-16 mx-auto mb-6 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/5">
                                <Globe className="text-purple-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">3. Instant Discovery</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Receive a curated list of production-ready repositories that match your exact needs, saving weeks of research time.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- Pricing Section --- */}
            <section id="pricing" className="py-24 px-6 relative bg-[#0a0a0c] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>

                <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black tracking-tight mb-6"
                    >
                        Simple, Transparent <span className="text-[#00e673]">Pricing</span>
                    </motion.h2>
                    <p className="text-slate-400 text-lg">Choose the plan that fits your research needs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
                    {/* Starter Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.0 }}
                        className="bg-[#0d1117]/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 flex flex-col hover:border-slate-700 transition-colors"
                    >
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-slate-300 mb-2">Starter</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">$0</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-4">Perfect for hobbyists and students.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-slate-300"><Check size={16} className="text-[#00e673]" /> 50 Searches / mo</li>
                            <li className="flex items-center gap-3 text-sm text-slate-300"><Check size={16} className="text-[#00e673]" /> Basic Filters</li>
                            <li className="flex items-center gap-3 text-sm text-slate-300"><Check size={16} className="text-[#00e673]" /> Save 5 Stacks</li>
                        </ul>
                        <button onClick={onStartFreeClick} className="w-full py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 transition-colors">Get Started</button>
                    </motion.div>

                    {/* Pro Plan (Featured) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0d1117]/80 backdrop-blur-md rounded-3xl p-8 border border-[#00e673]/30 flex flex-col relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-[#00e673]/5 to-transparent pointer-events-none"></div>
                        <div className="absolute top-0 right-0 p-4">
                            <span className="bg-[#00e673] text-black text-xs font-black uppercase tracking-wider px-2 py-1 rounded-md">Popular</span>
                        </div>

                        <div className="mb-8 relative">
                            <h3 className="text-lg font-medium text-[#00e673] mb-2 flex items-center gap-2"><Zap size={18} /> Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">$19</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-4">For serious developers and engineers.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 relative">
                            <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={16} className="text-[#00e673]" /> Unlimited Searches</li>
                            <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={16} className="text-[#00e673]" /> Advanced AI Reasoning</li>
                            <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={16} className="text-[#00e673]" /> Unlimited Stacks</li>
                            <li className="flex items-center gap-3 text-sm text-white font-medium"><Check size={16} className="text-[#00e673]" /> Priority Support</li>
                        </ul>
                        <button onClick={onStartFreeClick} className="relative w-full py-3 rounded-xl bg-[#00e673] text-black font-bold hover:bg-[#00d66c] transition-all shadow-lg shadow-[#00e673]/20 hover:scale-[1.02]">Upgrade to Pro</button>
                    </motion.div>

                    {/* Enterprise Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0d1117]/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-800 flex flex-col hover:border-slate-700 transition-colors"
                    >
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-slate-300 mb-2 flex items-center gap-2"><Shield size={18} /> Enterprise</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">Custom</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-4">Security and control for teams.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-sm text-slate-300"><Check size={16} className="text-slate-500" /> SSO & SAML</li>
                            <li className="flex items-center gap-3 text-sm text-slate-300"><Check size={16} className="text-slate-500" /> Private Repo Indexing</li>
                            <li className="flex items-center gap-3 text-sm text-slate-300"><Check size={16} className="text-slate-500" /> Dedicated Instance</li>
                        </ul>
                        <button className="w-full py-3 rounded-xl border border-slate-700 font-bold hover:bg-slate-800 transition-colors">Contact Sales</button>
                    </motion.div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-12 px-6 border-t border-slate-800/30 text-slate-500 text-sm bg-[#050505]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                        <Terminal size={16} className="text-[#00e673]" /> GITPULSE AI
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-[#00e673] transition-colors">Docs</a>
                        <a href="#" className="hover:text-[#00e673] transition-colors">GitHub</a>
                        <a href="#" className="hover:text-[#00e673] transition-colors">Privacy</a>
                    </div>
                    <div>© 2025 GitPulse AI Inc.</div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
