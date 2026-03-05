import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitHubRepo } from '../types';
import { Database } from 'lucide-react';

interface RepoCardProps {
  repo: GitHubRepo;
  isSaved: boolean;
  onToggleSave: (repo: Partial<GitHubRepo>) => void;
  onInteract?: (type: 'CLICK' | 'COPY', repo: GitHubRepo) => void;
  theme?: 'dark' | 'light';
}

// Icons (Inline for performance/consistency)
const StarIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.36a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
);

const ForkIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
);

const LawIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8.75.75a.75.75 0 0 0-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 0 1 3.984 3H1.75a.75.75 0 0 0 0 1.5h.428L.066 9.17a.75.75 0 0 0 .672 1.08h3.512a.75.75 0 0 0 .672-1.08L2.822 4.5h1.162c.305 0 .604-.08.869-.23l1.288-.737a.25.25 0 0 1 .125-.033H7.25v9.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5V3.5h.934c.046 0 .092.012.133.035l1.287.737c.265.15.564.23.869.23h1.162l-2.106 4.67a.75.75 0 0 0 .672 1.08h3.512a.75.75 0 0 0 .672-1.08L13.822 4.5h.428a.75.75 0 0 0 0-1.5h-2.234a.25.25 0 0 1-.125-.035l-1.287-.737A1.75 1.75 0 0 0 9.734 2H8.75V.75Zm-2.35 8.5h-2.8l1.4-3.111 1.4 3.111Zm7.5 0h-2.8l1.4-3.111 1.4 3.111Z"></path></svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 0 1 0 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 0 1 0-1.798c.45-.678 1.367-1.932 2.637-3.023C4.33 2.992 6.019 2 8 2ZM1.679 7.932a.12.12 0 0 0 0 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 0 0 0-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717ZM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"></path></svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M0 5.75C0 4.784.784 4 1.75 4h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25Z"></path><path d="M3.5 8a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9ZM3.5 10.5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-5Z"></path></svg>
);

const PeopleIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-3 2a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm7.094 4.156a.75.75 0 0 1 .37.965C8.942 12.834 6.852 14 5.5 14c-1.352 0-3.442-1.166-4.464-3.38a.75.75 0 0 1 1.328-.614C3.008 11.378 4.434 12.5 5.5 12.5c1.066 0 2.492-1.122 3.136-2.494a.75.75 0 0 1 .958-.35Zm4.906-1.156a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-3 2a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm7.094 4.156a.75.75 0 0 1 .37.965C13.942 12.834 11.852 14 10.5 14c-1.352 0-3.442-1.166-4.464-3.38a.75.75 0 0 1 1.328-.614C8.008 11.378 9.434 12.5 10.5 12.5c1.066 0 2.492-1.122 3.136-2.494a.75.75 0 0 1 .958-.35Z"></path></svg>
);

const PulseIcon = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M11.93 8.368a.75.75 0 0 1 1.059.081L15 10.94V7.75a.75.75 0 0 1 1.5 0v5a.75.75 0 0 1-.75.75h-5a.75.75 0 0 1 0-1.5h3.19l-2.01-2.492a.75.75 0 0 1 .081-1.059.75.75 0 0 1 .081-1.059ZM1 7.75a.75.75 0 0 1 .75-.75h3.19l2.01 2.492a.75.75 0 0 1-1.058 1.14l-2.011-2.493L1 10.939V7.75ZM7.75 1a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-3.19l-2.492 2.01a.75.75 0 0 1-1.14-1.058l2.493-2.011H7.75Z"></path></svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
);

// Smoke/Fog Component
const SmokeEffect = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700">
    <motion.div
      animate={{
        x: ["-20%", "0%", "-20%"],
        y: ["0%", "-10%", "0%"],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-50%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(0,230,115,0.08)_0%,transparent_60%)] blur-3xl rounded-full mix-blend-screen"
    />
    <motion.div
      animate={{
        x: ["0%", "20%", "0%"],
        y: ["-10%", "10%", "-10%"],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
      className="absolute bottom-[-30%] right-[-20%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)] blur-3xl rounded-full mix-blend-screen"
    />
    {/* Thin mist layer */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-200 contrast-150 mix-blend-overlay"></div>
  </div>
);

export const RepoCard: React.FC<RepoCardProps> = ({ repo, isSaved, onToggleSave, onInteract, theme = 'dark' }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(repo.uri);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    onInteract?.('COPY', repo);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.02,
        borderColor: theme === 'dark' ? 'rgba(0, 230, 115, 0.6)' : 'rgba(16, 185, 129, 0.4)',
        boxShadow: theme === 'dark' ? '0 0 30px rgba(0, 230, 115, 0.1)' : '0 10px 30px rgba(0,0,0,0.05)'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-xl border w-full max-w-[800px] shrink-0 transition-all duration-300 relative group overflow-hidden ${theme === 'dark'
        ? 'bg-[#0d1117]/90 backdrop-blur-md border-slate-800 text-zinc-300 shadow-lg'
        : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'
        }`}
    >

      {/* Smoke Effects (Visible mostly in dark mode or subtly in light) */}
      {theme === 'dark' && <SmokeEffect />}

      {/* Shine Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent" />

      <div className="flex flex-col relative z-10">
        {/* Main Content */}
        <div className="p-6 pb-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`p-2 rounded-lg shrink-0 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#161b22] border border-slate-700/50 group-hover:border-[#00e673]/30 group-hover:bg-[#00e673]/5' : 'bg-zinc-100'} `}>
                <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" className={theme === 'dark' ? 'text-[#00e673]' : 'text-zinc-700'}>
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                </svg>
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className={`font-black text-xl tracking-tight truncate transition-colors duration-300 ${theme === 'dark' ? 'text-white group-hover:text-[#00e673]' : 'text-zinc-900 group-hover:text-emerald-600'} `}>
                  {repo.owner} <span className="text-zinc-500 font-normal">/</span> {repo.name}
                </h3>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              onClick={() => onToggleSave(repo)}
              className={`p-2 rounded-lg transition-all ${isSaved ? 'text-black bg-[#00e673] shadow-[0_0_15px_rgba(0,230,115,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-slate-800'} `}
              title={isSaved ? "Remove from saved" : "Save repository"}
            >
              <BookmarkIcon filled={isSaved} />
            </motion.button>
          </div>

          {/* URI Row */}
          <div className="flex items-center gap-2 mb-6 pl-[3.25rem]">
            <a href={repo.uri} target="_blank" rel="noopener noreferrer" onClick={() => onInteract?.('CLICK', repo)} className="text-violet-500 hover:underline font-mono text-xs truncate max-w-[300px] block opacity-80 hover:opacity-100 transition-opacity">
              {repo.uri}
            </a>
            <button
              onClick={handleCopy}
              className={`p-1 rounded-md transition-all ${isCopied ? 'text-[#00e673] bg-[#00e673]/10 transform scale-110' : 'text-zinc-500 hover:text-zinc-300'} `}
              title="Copy URL"
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>

          <p className={`text-[15px] leading-relaxed mb-6 text-pretty font-medium transition-colors ${theme === 'dark' ? 'text-zinc-300 group-hover:text-zinc-200' : 'text-zinc-600'} `}>
            {repo.description || "No description provided."}
          </p>
        </div>

        {/* Footer Stats */}
        <div className={`px-6 pb-6 pt-2 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs border-t-0 relative z-20 ${theme === 'dark' ? 'text-slate-400' : 'text-zinc-600'} `}>
          {repo.language && (
            <div className="flex items-center gap-2 mr-2 px-2 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f1e05a] shadow-[0_0_8px_rgba(241,224,90,0.4)]"></span>
              <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-zinc-800'} `}>{repo.language}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 hover:text-amber-400 transition-colors" title="Stars"><div className="text-amber-400"><StarIcon /></div> <span className="font-semibold">{repo.stars || '0'}</span></div>
          <div className="flex items-center gap-1.5 hover:text-purple-400 transition-colors" title="Forks"><div className="text-purple-400"><ForkIcon /></div> <span className="font-semibold">{repo.forks || '0'}</span></div>
          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors" title="Watchers"><EyeIcon /> <span className="font-semibold">{repo.watchers || '0'}</span></div>
          <div className="flex items-center gap-1.5 text-emerald-500" title="Activity"><PulseIcon /> <span className="font-semibold">Active</span></div>

          <div className="flex-1" />

          {/* New Badges */}
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-[10px] font-mono text-[#00e673] shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e673] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00e673]"></span>
            </span>
            Real-time
          </div>
        </div>
      </div>
    </motion.div>
  );
};
