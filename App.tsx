import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gitPulse } from './services/geminiService';
import { dbService } from './services/dbService';
import { ChatMessage, ModelMode, GitHubRepo, ChatHistory, SavedStack, GroundingSource } from './types';
import { RepoCard } from './components/RepoCard';
import { SourceCard } from './components/SourceCard';
import { perplexity } from './services/perplexityService';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import LandingPage from './components/LandingPage';

// --- History / Navigation Helper ---
const pushState = (params: Record<string, string>, path = '/') => {
  const url = new URL(window.location.href);
  url.pathname = path;
  url.search = '';
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });
  window.history.pushState(params, '', url.toString());
};



// --- Icons ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" /></svg>
);
const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>
);
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" strokeLinecap="round" /><line x1="16" y1="16" x2="16" y2="16" strokeLinecap="round" /></svg>
);
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);
const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
);
const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>
);
const SparkleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
);
const AlgorithmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4 4" /><circle cx="11" cy="11" r="8" /><path d="m8 11 2 2 4-4" /></svg>
);
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.36a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path></svg>
);
const ForkIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path></svg>
);
const LawIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8.75.75a.75.75 0 0 0-1.5 0V2h-.984c-.305 0-.604.08-.869.23l-1.288.737A.25.25 0 0 1 3.984 3H1.75a.75.75 0 0 0 0 1.5h.428L.066 9.17a.75.75 0 0 0 .672 1.08h3.512a.75.75 0 0 0 .672-1.08L2.822 4.5h1.162c.305 0 .604-.08.869-.23l1.288-.737a.25.25 0 0 1 .125-.033H7.25v9.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5V3.5h.934c.046 0 .092.012.133.035l1.287.737c.265.15.564.23.869.23h1.162l-2.106 4.67a.75.75 0 0 0 .672 1.08h3.512a.75.75 0 0 0 .672-1.08L13.822 4.5h.428a.75.75 0 0 0 0-1.5h-2.234a.25.25 0 0 1-.125-.035l-1.287-.737A1.75 1.75 0 0 0 9.734 2H8.75V.75Zm-2.35 8.5h-2.8l1.4-3.111 1.4 3.111Zm7.5 0h-2.8l1.4-3.111 1.4 3.111Z"></path></svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);

const DISCOVERY_OPTIONS = {
  categories: [
    { id: 'cat_best', name: 'Best / Trending', icon: '⭐', desc: 'Highly rated projects' },
    { id: 'cat_simple', name: 'Simple / Beginner', icon: '🌱', desc: 'Easy to understand code' },
    { id: 'cat_ent', name: 'Enterprise / Scale', icon: '🏢', desc: 'Massive scalability' },
    { id: 'cat_web', name: 'Web Applications', icon: '🌐', desc: 'SaaS and modern sites' },
    { id: 'cat_cli', name: 'CLI Utilities', icon: '💻', desc: 'Developer tools' },
  ],
  tech: [
    { id: 'tech_react', name: 'React / Next.js', icon: '⚛️', desc: 'Modern frontend stack' },
    { id: 'tech_tailwind', name: 'Tailwind CSS', icon: '🎨', desc: 'Utility-first styling' },
    { id: 'tech_springboot', name: 'Spring Boot', icon: '🍃', desc: 'Enterprise Java backend' },
    { id: 'tech_rust', name: 'Rust / Systems', icon: '🦀', desc: 'High performance code' },
    { id: 'tech_python', name: 'Python / AI', icon: '🐍', desc: 'LLMs and automation' },
  ],
  constraints: [
    { id: 'cons_perf', name: 'Low Latency', icon: '⚡', desc: 'Blazing fast runtime' },
    { id: 'cons_zero', name: 'Zero Dependencies', icon: '📦', desc: 'Lightweight & simple' },
    { id: 'cons_doc', name: 'Docs Rich', icon: '📚', desc: 'Perfect documentation' },
    { id: 'cons_sec', name: 'Security First', icon: '🛡️', desc: 'Hardened against attacks' },
    { id: 'cons_mit', name: 'MIT Licensed', icon: '⚖️', desc: 'Open and permissive' },
  ]
};

const CATEGORIZED_EXAMPLES = [
  {
    category: "Security",
    options: [
      { title: "Hacking Tools", prompt: "Top 10 hacking tools in github", color: "emerald" },
      { title: "Red Team Ops", prompt: "Best open source red teaming frameworks", color: "emerald" },
      { title: "Bug Bounty", prompt: "Top bug bounty hunting tools and scanners", color: "emerald" },
    ]
  },
  {
    category: "Student",
    options: [
      { title: "Student Project", prompt: "Best student project you should know", color: "blue" },
      { title: "Final Year", prompt: "Impressive final year computer science projects", color: "blue" },
      { title: "Beginner Apps", prompt: "Simple but cool projects for student portfolios", color: "blue" },
    ]
  },
  {
    category: "Secret",
    options: [
      { title: "Secret Tools", prompt: "Top 1% Secret tools in git hub", color: "purple" },
      { title: "Underrated", prompt: "Underrated GitHub tools you missed", color: "purple" },
      { title: "Hidden Gems", prompt: "Hidden Gems: Useful but unknown repos", color: "purple" },
    ]
  },
  {
    category: "Full Stack",
    options: [
      { title: "Full Stack", prompt: "Best python/java/full stack Projects", color: "cyan" },
      { title: "MERN Stack", prompt: "Modern MERN Stack Boilerplates with Auth", color: "cyan" },
      { title: "Spring Boot", prompt: "Production-Grade Java Spring Boot Templates", color: "cyan" },
    ]
  },
  {
    category: "AI/ML",
    options: [
      { title: "Skill Resources", prompt: "Top Best Resources for AI/ML in github", color: "pink" },
      { title: "LLM Engineering", prompt: "Must-have LLM Engineering Resources", color: "pink" },
      { title: "GenAI Guides", prompt: "Generative AI Implementation Guides", color: "pink" },
    ]
  },
  {
    category: "Finance",
    options: [
      { title: "Finance & Invest", prompt: "Top best Trading/investment/finance resources github repos", color: "emerald" },
      { title: "Algo Trading", prompt: "Open Source Algorithmic Trading Bots and Backtesters", color: "emerald" },
      { title: "Quant Finance", prompt: "Quantitative Finance Libraries in Python", color: "emerald" },
    ]
  },
  {
    category: "Startup",
    options: [
      { title: "Startup Kit", prompt: "The 3 Best Startup friendly github repos", color: "cyan" },
      { title: "SaaS Starter", prompt: "SaaS Starter Kits for Solo Founders", color: "cyan" },
      { title: "Business Intel", prompt: "Open Source Business Intelligence Tools", color: "cyan" },
    ]
  },
  {
    category: "PhD",
    options: [
      { title: "PhD Research", prompt: "Top Research paper repos for Phds", color: "blue" },
      { title: "Paper Impl", prompt: "Implementation of Latest Arxiv Papers", color: "blue" },
      { title: "Academic Tools", prompt: "Academic Research Tools and LaTeX Templates", color: "blue" },
    ]
  },
  {
    category: "Knowledge",
    options: [
      { title: "Knowledge Hub", prompt: "The 5 best Repos for Books/Blogs/Resources", color: "purple" },
      { title: "Free Books", prompt: "Free Programming Books and Courses Collection", color: "purple" },
      { title: "Roadmaps", prompt: "Developer Roadmaps and Learning Paths", color: "purple" },
    ]
  }
];

const MIN_SELECTIONS = 1;
const MAX_SELECTIONS = 5;

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-emerald-500 font-mono relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
        <div className="absolute inset-2 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase ">Initializing Protocol</h2>
        <p className="text-[10px] text-emerald-500/60 animate-pulse">Est. Secure Uplink...</p>
      </div>
    </div>
  </div>
);

interface ResponseBlock {
  type: 'repo' | 'text';
  title?: string;
  link?: string;
  stats?: Record<string, string>;
  desc: string;
}

const FormattedResponse = ({ text, repos, onToggleSave, savedUris, theme }: { text: string; repos?: GitHubRepo[]; onToggleSave: (repo: Partial<GitHubRepo>) => void; savedUris: Set<string>; theme: 'dark' | 'light' }) => {
  const { user } = useAuth();

  const lines = text.split('\n');
  const blocks: ResponseBlock[] = [];
  let currentBlock: { type: 'repo', title?: string; link?: string; stats?: Record<string, string>; descLines: string[] } | null = null;
  let textBuffer: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed && !currentBlock) {
      if (textBuffer.length) {
        blocks.push({ type: 'text', desc: textBuffer.join('\n') });
        textBuffer = [];
      }
      return;
    }

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 80) {
      if (textBuffer.length) {
        blocks.push({ type: 'text', desc: textBuffer.join('\n') });
        textBuffer = [];
      }
      if (currentBlock) blocks.push({ ...currentBlock, type: 'repo', desc: currentBlock.descLines.join(' ') });
      currentBlock = { type: 'repo', title: trimmed.replace(/\*\*/g, ''), descLines: [] };
    }
    else if (trimmed.startsWith('http') && currentBlock && !currentBlock.link) {
      currentBlock.link = trimmed;
    }
    else if (trimmed.startsWith('[Stats:') && currentBlock && !currentBlock.stats) {
      const statsStr = trimmed.slice(7, -1);
      const parts = statsStr.split('|').map(p => p.trim());
      const statsObj: Record<string, string> = {};
      parts.forEach(p => {
        const [key, val] = p.split(':').map(s => s.trim());
        if (key && val) statsObj[key.toLowerCase()] = val;
      });
      currentBlock.stats = statsObj;
    }
    else {
      if (currentBlock) {
        currentBlock.descLines.push(line);
      } else {
        textBuffer.push(line);
      }
    }
  });

  if (textBuffer.length) blocks.push({ type: 'text', desc: textBuffer.join('\n') });
  if (currentBlock) blocks.push({ ...currentBlock, type: 'repo', desc: currentBlock.descLines.join(' ') });

  let repoBlocks = blocks.filter(b => b.type === 'repo');
  const otherBlocks = blocks.filter(b => b.type === 'text');

  // Convert legacy blocks to GitHubRepo format
  const parsedRepos: GitHubRepo[] = repoBlocks.map(block => ({
    owner: block.title?.split('/')[0] || 'Unknown',
    name: block.title || 'Repository',
    uri: block.link || '#',
    description: block.desc,
    stars: block.stats?.stars,
    forks: block.stats?.forks,
    license: block.stats?.license,
    language: block.stats?.language,
    trustScore: 92,
    fitType: 'Production'
  }));

  // Combine with structured repos from props
  const allRepos = [...parsedRepos, ...(repos || [])];

  const displayedRepos = allRepos;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-12">
      {/* Show leading text if any */}
      {otherBlocks.map((block, idx) => (
        <motion.div
          key={`text-${idx}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="duration-500"
        >
          <p className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap ${theme === 'dark' ? 'text-zinc-400 font-medium' : 'text-zinc-600 font-medium'}`}>
            {block.desc}
          </p>
        </motion.div>
      ))}

      {/* Show Paginated Repositories */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {displayedRepos.map((repo, idx) => {
          return (
            <motion.div key={`repo-${idx}`} variants={item}>
              <RepoCard
                repo={repo}
                isSaved={savedUris.has(repo.uri)}
                onToggleSave={(r) => onToggleSave({ uri: r.uri, name: r.name })}
                onInteract={(type, r) => {
                  if (user) dbService.logActivity(user.uid, `REPO_${type}`, { repoUri: r.uri });
                }}
                theme={theme}
              />
            </motion.div>
          );
        })}
      </motion.div>


    </div>
  );
};


function GitPulseApp() {
  const { user, loading, logout } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');

  if (loading) return <LoadingScreen />;

  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onLoginClick={() => setAuthView('login')}
          onStartFreeClick={() => setAuthView('login')}
        />
      );
    }

    return <Login onBack={() => setAuthView('landing')} />;
  }
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [modelMode, setModelMode] = useState<ModelMode>(ModelMode.FAST);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [savedStacks, setSavedStacks] = useState<SavedStack[]>([]);
  const [savedUris, setSavedUris] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [selections, setSelections] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Randomize examples on mount
  const examples = useMemo(() => {
    return CATEGORIZED_EXAMPLES.map(cat => {
      const randomOption = cat.options[Math.floor(Math.random() * cat.options.length)];
      return randomOption;
    });
  }, []);
  const [placeholderText, setPlaceholderText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const fullPlaceholder = "Describe a github repo you are looking for..";

  useEffect(() => {
    if (messages.length > 0) return;

    let index = 0;
    const timer = setInterval(() => {
      setPlaceholderText(fullPlaceholder.slice(0, index));
      index++;
      if (index > fullPlaceholder.length) {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [messages.length]);

  // Sync User Profile
  useEffect(() => {
    if (user) {
      dbService.syncUserProfile(user);
    }
  }, [user]);

  // Load User Data from Firestore & LocalStorage
  useEffect(() => {
    async function loadUserData() {
      if (user) {
        try {
          // 1. Try loading from LocalStorage first (Instant)
          const localStacks = localStorage.getItem(`gitpulse_stacks_${user.uid}`);
          const localHistory = localStorage.getItem(`gitpulse_history_${user.uid}`);

          if (localStacks) setSavedStacks(JSON.parse(localStacks));
          if (localHistory) setChatHistory(JSON.parse(localHistory));

          // 2. Fetch from Firestore (Source of Truth)
          // Load Saved Stacks
          const saved = await dbService.getSavedStacks(user.uid);
          setSavedStacks(saved);
          localStorage.setItem(`gitpulse_stacks_${user.uid}`, JSON.stringify(saved));

          // Rebuild savedUris Set for O(1) checks
          const uris = new Set<string>();
          saved.forEach(s => s.repos.forEach(r => uris.add(r.uri)));
          setSavedUris(uris);

          // Load Chat History
          const history = await dbService.getChatHistory(user.uid);
          setChatHistory(history);
          localStorage.setItem(`gitpulse_history_${user.uid}`, JSON.stringify(history));

        } catch (error) {
          console.error("Failed to load user data", error);
        }
      } else {
        setSavedStacks([]);
        setSavedUris(new Set());
        setChatHistory([]);
        setMessages([]); // Reset to default state
      }
    }
    loadUserData();
  }, [user]);

  // --- History Integration ---
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const url = new URL(window.location.href);
      const sessionParam = url.searchParams.get('session');
      const settingsParam = url.searchParams.get('settings');

      // 1. Settings Navigation
      if (settingsParam === 'true') {
        setShowSettings(true);
      } else {
        setShowSettings(false);
      }

      // 2. Chat Session Navigation
      if (sessionParam) {
        // Find session in 'chatHistory'
        const restoredSession = chatHistory.find(h => h.id === sessionParam);
        if (restoredSession) {
          setMessages(restoredSession.messages);
          setCurrentSessionId(restoredSession.id);
        } else if (sessionParam !== currentSessionId) {
          // Try to find in localStorage if state is stale
          if (user) {
            const localHistory = localStorage.getItem(`gitpulse_history_${user.uid}`);
            if (localHistory) {
              const parsed: ChatHistory[] = JSON.parse(localHistory);
              const found = parsed.find(h => h.id === sessionParam);
              if (found) {
                setMessages(found.messages);
                setCurrentSessionId(found.id);
              }
            }
          }
        }
      } else {
        // No session param -> Clear chat
        if (currentSessionId && !settingsParam) { // Only clear if we were in a session and not just toggling settings
          startNewChat(false); // false = don't push state again
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial Load Logic (Deep Linking)
    const url = new URL(window.location.href);
    const initialSession = url.searchParams.get('session');

    // Check if we can restore immediately from state OR localStorage
    if (initialSession) {
      if (chatHistory.length > 0) {
        const h = chatHistory.find(item => item.id === initialSession);
        if (h) loadHistory(h, false);
      } else if (user) {
        // Fallback to local storage for deep link on refresh
        const localHistory = localStorage.getItem(`gitpulse_history_${user.uid}`);
        if (localHistory) {
          const parsed: ChatHistory[] = JSON.parse(localHistory);
          const found = parsed.find(h => h.id === initialSession);
          if (found) loadHistory(found, false);
        }
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [chatHistory, currentSessionId, user]); // Re-bind when history changes so we can look it up

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsSearching(false);

      // Add a system message indicating cancellation
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '⚠️ Generation stopped by user.',
        repos: [],
        sources: []
      }]);
    }
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && !lastMsg.isThinking) {
      // If assistant finished responding, scroll to the TOP of the response so first link is visible
      const msgEl = document.getElementById(`msg-${lastMsg.id}`);
      if (msgEl) {
        // slight offset for sticky header considerations if needed, but 'start' is usually good
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Otherwise (User typing, thinking state) scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('gitPulseTheme', theme);
    document.documentElement.style.backgroundColor = theme === 'dark' ? '#09090b' : '#fafafa';
    document.documentElement.style.color = theme === 'dark' ? '#fafafa' : '#09090b';
  }, [theme]);

  const toggleSelection = (id: string) => {
    setSelections(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      if (prev.length >= MAX_SELECTIONS) {
        setNotification(`Limit: Max ${MAX_SELECTIONS} protocols.`);
        setTimeout(() => setNotification(null), 2500);
        return prev;
      }
      return [...prev, id];
    });
  };

  const startNewChat = (shouldPushState = true) => {
    setMessages([]);
    setSelections([]);
    setInput('');
    setCurrentSessionId(null);
    setShowSettings(false);
    setIsMobileMenuOpen(false);
    if (shouldPushState) pushState({});
  };

  const loadHistory = (history: ChatHistory, shouldPushState = true) => {
    setMessages(history.messages);
    setCurrentSessionId(history.id);
    setShowSettings(false);
    setIsMobileMenuOpen(false);
    if (shouldPushState) pushState({ session: history.id });
  };

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return; // Only allow deletion if logged in

    try {
      await dbService.deleteChatHistory(user.uid, id);
      dbService.logActivity(user.uid, 'HISTORY_DELETE', { historyId: id });
      const updatedHistory = chatHistory.filter(h => h.id !== id);
      setChatHistory(updatedHistory);
      localStorage.setItem(`gitpulse_history_${user.uid}`, JSON.stringify(updatedHistory));
      if (currentSessionId === id) startNewChat();
    } catch (error) {
      console.error("Failed to delete chat history", error);
    }
  };

  const toggleSaveRepo = async (repo: Partial<GitHubRepo>) => {
    if (!repo.uri || !user) return; // Only allow saving if logged in

    const isSaved = savedUris.has(repo.uri);
    const newUris = new Set(savedUris);

    // OPTIMISTIC UPDATE: Update UI immediately
    if (isSaved) {
      newUris.delete(repo.uri);
      // LOG ACTIVITY: UNSAVE
      dbService.logActivity(user.uid, 'REPO_UNSAVE', { repoUri: repo.uri, repoName: repo.name });
    } else {
      newUris.add(repo.uri);
      // LOG ACTIVITY: SAVE
      dbService.logActivity(user.uid, 'REPO_SAVE', { repoUri: repo.uri, repoName: repo.name });
    }
    setSavedUris(newUris);

    if (isSaved) {
      setSavedStacks(prev => {
        const next = prev.filter(s => s.id !== repo.uri);
        localStorage.setItem(`gitpulse_stacks_${user.uid}`, JSON.stringify(next));
        return next;
      });
    } else {
      const tempStack: SavedStack = {
        id: repo.uri,
        stackId: repo.uri,
        name: repo.name || 'Repository',
        repos: [repo as GitHubRepo],
        timestamp: Date.now()
      };
      setSavedStacks(prev => {
        const next = [tempStack, ...prev];
        localStorage.setItem(`gitpulse_stacks_${user.uid}`, JSON.stringify(next));
        return next;
      });
    }

    try {
      // Perform DB Operation in background
      if (isSaved) {
        await dbService.removeStack(user.uid, repo.uri);
      } else {
        await dbService.saveStack(user.uid, {
          id: repo.uri,
          stackId: repo.uri,
          name: repo.name || 'Repository',
          repos: [repo as GitHubRepo],
          timestamp: Date.now()
        });
      }
      // REMOVED fetch to avoid stale read race condition
    } catch (error) {
      console.error("Save failed, reverting", error);
      // Revert UI on error
      if (isSaved) {
        newUris.add(repo.uri);
        // revert stack removal - fetch fresh to be safe
        const fresh = await dbService.getSavedStacks(user.uid);
        setSavedStacks(fresh);
      } else {
        newUris.delete(repo.uri);
        setSavedStacks(prev => prev.filter(s => s.id !== repo.uri));
      }
      setSavedUris(new Set(newUris));
      setNotification(`Error saving stack.`);
    }

    setTimeout(() => setNotification(null), 1000);
  };

  const handleSubmit = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const activePrompt = customPrompt || input;
    if (!activePrompt.trim() && selections.length === 0 || isSearching) return;

    // Reset abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const sessionId = currentSessionId || Date.now().toString();

    if (!currentSessionId) {
      setCurrentSessionId(sessionId);
      pushState({ session: sessionId });
    }

    let finalPrompt = activePrompt;
    let displayPrompt = activePrompt;

    if (selections.length > 0 && messages.length === 0) {
      const selectedNames = [...DISCOVERY_OPTIONS.categories, ...DISCOVERY_OPTIONS.tech, ...DISCOVERY_OPTIONS.constraints]
        .filter(opt => selections.includes(opt.id)).map(opt => opt.name);

      finalPrompt = `Conduct deep research and discovery targeting: ${selectedNames.join(', ')}. ${activePrompt ? 'Additional context: ' + activePrompt : ''}`;

      if (!activePrompt.trim()) {
        displayPrompt = `Exploration: ${selectedNames.join(', ')}`;
      } else {
        displayPrompt = activePrompt;
      }
    }

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: displayPrompt };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsSearching(true);

    // LOG ACTIVITY: SEARCH
    if (user) {
      dbService.logActivity(user.uid, 'SEARCH', {
        query: finalPrompt,
        displayQuery: displayPrompt,
        filters: selections
      });
    }

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = { id: assistantId, role: 'assistant', content: '', isThinking: true, repos: [], sources: [] };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Extract selected constraints for Advanced Search
      const selectedConstraints = selections.length > 0
        ? [...DISCOVERY_OPTIONS.categories, ...DISCOVERY_OPTIONS.tech, ...DISCOVERY_OPTIONS.constraints]
          .filter(opt => selections.includes(opt.id))
          .map(opt => opt.name)
        : [];

      const response = await perplexity.search(finalPrompt, selectedConstraints, controller.signal);

      const finalContent = response.text;
      const finalRepos = response.repos || [];
      const finalSources = response.sources || [];

      setMessages(prev => prev.map(msg => msg.id === assistantId ? {
        ...msg,
        content: finalContent,
        repos: finalRepos,
        sources: finalSources,
        isThinking: false
      } : msg));
      // --------------------------------------------------------

      const newHistoryItem: ChatHistory = {
        id: sessionId,
        title: displayPrompt.slice(0, 40) + (displayPrompt.length > 40 ? '...' : ''),
        messages: [...updatedMessages, { id: assistantId, role: 'assistant', content: finalContent, repos: finalRepos, sources: finalSources }],
        timestamp: Date.now()
      };

      // Bump to top logic
      const otherHistory = chatHistory.filter(h => h.id !== sessionId);
      const updatedHistory = [newHistoryItem, ...otherHistory];

      setChatHistory(updatedHistory);
      if (user) {
        localStorage.setItem(`gitpulse_history_${user.uid}`, JSON.stringify(updatedHistory));
      }

      // Save to Firestore instead of localStorage
      if (user) {
        dbService.saveChatHistory(user.uid, newHistoryItem).catch(console.error);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Search aborted');
        return;
      }
      console.error(error);
      const errorContent = "ERROR: Analysis failed. Please check your connectivity.";
      setMessages(prev => prev.map(msg => msg.id === assistantId ? { ...msg, content: errorContent, isThinking: false } : msg));

      // Also save history on error so it's not lost
      const errorHistoryItem: ChatHistory = {
        id: sessionId,
        title: displayPrompt.slice(0, 40) + (displayPrompt.length > 40 ? '...' : ''),
        messages: [...updatedMessages, { id: assistantId, role: 'assistant', content: errorContent, repos: [], sources: [] }],
        timestamp: Date.now()
      };

      const otherHistory = chatHistory.filter(h => h.id !== sessionId);
      const updatedHistory = [errorHistoryItem, ...otherHistory];
      setChatHistory(updatedHistory);

      if (user) {
        dbService.saveChatHistory(user.uid, errorHistoryItem).catch(console.error);
      }

    } finally {
      setIsSearching(false);
      abortControllerRef.current = null;
    }
  };


  const deleteStackItem = async (e: React.MouseEvent, stackId: string) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    if (!user) return;

    // Optimistic UI Update
    const previousStacks = [...savedStacks];
    const previousUris = new Set(savedUris);

    const updatedStacks = savedStacks.filter(s => s.id !== stackId);
    setSavedStacks(updatedStacks);
    localStorage.setItem(`gitpulse_stacks_${user.uid}`, JSON.stringify(updatedStacks));

    // Update savedURIs immediately so the main view bookmark icons update
    const newUris = new Set<string>();
    updatedStacks.forEach(s => s.repos.forEach(r => newUris.add(r.uri)));
    setSavedUris(newUris);

    try {
      await dbService.removeStack(user.uid, stackId);
    } catch (error) {
      console.error("Failed to delete stack", error);
      // Revert if failed
      setSavedStacks(previousStacks);
      setSavedUris(previousUris);
      localStorage.setItem(`gitpulse_stacks_${user.uid}`, JSON.stringify(previousStacks));
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 md:p-8 flex items-center gap-4 cursor-pointer group" onClick={startNewChat}>
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black shadow-lg transition-transform group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 8-4 4 4 4" /><path d="m17 8 4 4-4 4" /><path d="m14 4-4 16" /></svg>
        </div>
        <h1 className="text-xl font-black tracking-tight italic">GITPULSE <span className="text-emerald-500 not-italic">AI</span></h1>
      </div>

      <div className="px-4 mb-4">
        <button onClick={startNewChat} className={`w-full flex items-center gap-3 border p-3.5 rounded-2xl transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'}`}>
          <div className="p-1.5 rounded-lg bg-emerald-500 text-black"><PlusIcon /></div>
          <span className="font-bold text-sm text-wrap text-left leading-tight">New Discovery Session</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-8 pb-10 hide-scrollbar">
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 flex items-center gap-2"><HistoryIcon /> History</h4>
          <div className="space-y-1">
            {chatHistory.map(h => (
              <div key={h.id} className="group relative">
                <button onClick={() => loadHistory(h)} className={`w-full text-left p-2.5 rounded-xl text-xs transition-all truncate border border-transparent ${currentSessionId === h.id ? 'bg-zinc-800/80 text-emerald-400 font-bold' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>{h.title}</button>
                <button onClick={(e) => deleteHistoryItem(e, h.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400"><TrashIcon /></button>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 flex items-center gap-2"><BookmarkIcon /> Bookmarked Stacks</h4>
          <div className="space-y-1">
            {savedStacks.map(s => (
              <div key={s.id} className="group relative">
                <a href={s.stackId} target="_blank" rel="noopener noreferrer" className="block w-full flex items-center gap-2 p-2.5 rounded-xl text-xs text-zinc-500 hover:bg-zinc-900 hover:text-white truncate transition-all pr-8">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /> {s.name}
                </a>
                <button onClick={(e) => deleteStackItem(e, s.id)} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 transition-opacity"><TrashIcon /></button>
              </div>
            ))}
            {savedStacks.length === 0 && <p className="px-2 text-[10px] text-zinc-700 uppercase tracking-tighter">No stacks saved yet</p>}
          </div>
        </div>
      </div>


      <div className={`p-4 border-t space-y-4 sticky bottom-0 z-20 ${theme === 'dark' ? 'border-zinc-800/50 bg-[#050505]/95 backdrop-blur-xl' : 'border-zinc-200 bg-white/95 backdrop-blur-xl'}`}>
        <button
          onClick={() => {
            const newState = !showSettings;
            setShowSettings(newState);
            setIsMobileMenuOpen(false);
            if (newState) {
              pushState({ settings: 'true', ...(currentSessionId ? { session: currentSessionId } : {}) });
            } else {
              pushState(currentSessionId ? { session: currentSessionId } : {});
            }
          }}
          className={`group w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border ${showSettings
            ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20'
            : (theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`transition-transform duration-500 ${showSettings ? 'rotate-180' : 'group-hover:rotate-90'}`}>
              <SettingsIcon />
            </div>
            <span className="font-bold text-sm">Preferences</span>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${showSettings ? 'bg-black scale-125' : 'bg-zinc-700 opacity-0 group-hover:opacity-100'}`}></div>
        </button>

        <button
          onClick={() => { logout(); setAuthView('login'); setIsMobileMenuOpen(false); }}
          className={`group w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
            }`}
        >
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            <span className="font-bold text-sm">Sign Out</span>
          </div>
        </button>

        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 status-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mono">Kernel: v2.5.0</span>
          </div>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tighter mono">SLA: 99.9%</span>
        </div>
      </div>
    </div >
  );

  return (
    <div className={`flex flex-col lg:flex-row h-screen overflow-hidden transition-colors duration-300 relative ${theme === 'dark' ? 'bg-[#050505] text-slate-50' : 'bg-[#fafafa] text-zinc-900'}`}>

      {/* --- Global Background Effects (Dark Mode) --- */}
      {theme === 'dark' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00e673]/5 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
      )}

      {/* --- Global Background Effects (Light Mode - Smoke Animation) --- */}
      {theme === 'light' && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#00e673]/10 blur-[100px] rounded-full animate-blob mix-blend-multiply" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#00e673]/15 blur-[120px] rounded-full animate-blob animation-delay-2000 mix-blend-multiply" />
          <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-[#00e673]/10 blur-[100px] rounded-full animate-blob animation-delay-4000 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
      )}

      {notification && (
        <div className="fixed top-20 lg:top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 w-[90%] md:w-auto">
          <div className="bg-[#00e673] text-black px-6 py-3 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
            <BookmarkIcon filled /> {notification}
          </div>
        </div>
      )}

      <nav className={`w-80 border-r shrink-0 hidden lg:flex flex-col transition-colors sticky top-0 h-screen z-40 ${theme === 'dark' ? 'bg-[#050505]/80 backdrop-blur-sm border-slate-800/50' : 'bg-white border-zinc-200'}`}>
        <SidebarContent />
      </nav>

      <div className={`lg:hidden flex items-center justify-between p-4 border-b z-[60] sticky top-0 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={startNewChat}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m7 8-4 4 4 4" /><path d="m17 8 4 4-4 4" /></svg>
          </div>
          <span className="font-black italic text-sm tracking-tight">GITPULSE <span className="text-emerald-500 not-italic">AI</span></span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">{isMobileMenuOpen ? <XIcon /> : <MenuIcon />}</button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-[85%] h-full max-w-sm animate-slide-right ${theme === 'dark' ? 'bg-zinc-950' : 'bg-white'}`}>
            <SidebarContent />
          </div>
          <div className="flex-1 h-full" onClick={() => setIsMobileMenuOpen(false)}></div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="fixed top-6 right-8 hidden lg:flex items-center gap-3 z-[60]">
          {/* User Profile */}
          <div className={`flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700 shadow-sm'}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs overflow-hidden relative">
              {user?.photoURL ? (
                <>
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  {/* Fallback underneath in case image hides/fails */}
                  <span className="absolute inset-0 flex items-center justify-center -z-10">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </>
              ) : (
                <span>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <span className="font-bold text-sm max-w-[100px] truncate">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
          </div>

          <div className={`flex items-center h-10 px-4 rounded-full border transition-all hover:bg-zinc-800/10 ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}>
            <GithubIcon />
            <span className="ml-2 font-bold mono text-sm">33.7K</span>
          </div>

          <button onClick={toggleTheme} className={`p-2.5 rounded-full border transition-all hover:scale-105 shadow-sm ${theme === 'dark' ? 'bg-zinc-900/40 border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'bg-white/80 border-zinc-300 text-zinc-700 hover:bg-zinc-50'}`}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
          {showSettings ? (
            <div className="p-6 md:p-20 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tighter">System Preferences</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className={`p-3 rounded-2xl border transition-all hover:rotate-90 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 shadow-sm'}`}
                  >
                    <XIcon />
                  </button>
                </div>
                <p className="text-sm md:text-lg text-zinc-500 font-medium">Configure inference parameters and kernel behavior.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
                      <BotIcon />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">Inference Logic</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Choose between speed-optimized responses or deep architectural reasoning.</p>
                  <div className="flex flex-col gap-3 pt-2">
                    {[ModelMode.PRO, ModelMode.FAST].map(m => (
                      <button
                        key={m}
                        onClick={() => setModelMode(m)}
                        className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all group ${modelMode === m
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                          : (theme === 'dark' ? 'text-zinc-500 border-zinc-800 hover:border-zinc-700 bg-zinc-900/50' : 'text-zinc-500 border-zinc-100 hover:border-zinc-200 bg-zinc-50')
                          }`}
                      >
                        <span>{m === ModelMode.PRO ? 'Deep Reasoning' : 'Fast Response'}</span>
                        <div className={`w-2 h-2 rounded-full transition-all ${modelMode === m ? 'bg-black scale-125' : 'bg-zinc-800 group-hover:bg-zinc-600'}`}></div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-purple-500">
                      <SparkleIcon />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">Visual Stack</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Customize the user interface environment and visual comfort level.</p>
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={toggleTheme}
                      className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all ${theme === 'dark'
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-600'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
                        <span>{theme === 'dark' ? 'Obsidian Protocol' : 'Light Mode'}</span>
                      </div>
                      <span className="text-[8px] font-bold opacity-50">Active</span>
                    </button>
                  </div>
                </div>

                {/* Account Management Card */}
                <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                      <UserIcon />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">Account</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">Manage your active session and identity.</p>

                  <div className={`flex items-center gap-3 p-3 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs">
                      {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-xs truncate">{user?.displayName || 'User'}</span>
                      <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setAuthView('login');
                        setShowSettings(false);
                      }}
                      className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all group ${theme === 'dark'
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:border-blue-500/30 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                        <span>Switch Account</span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-blue-500 transition-colors"></div>
                    </button>
                  </div>
                </div>

                {/* Connect with Founder Card */}
                <div className={`p-8 rounded-3xl border space-y-6 ${theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">Who's Alaric?</h3>
                      <p className="text-xs text-zinc-500">Connect with the founder.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* LinkedIn */}
                    <a href="https://www.linkedin.com/in/adharsh-swaroop-kandlpalli" target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all hover:scale-105 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 hover:border-blue-700/50 hover:bg-blue-900/10 group' : 'bg-zinc-50 border-zinc-100 hover:border-blue-200 hover:bg-blue-50 group'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-[#0A66C2] transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                    </a>

                    {/* X (Twitter) */}
                    <a href="https://x.com/Whos_Alaric_00" target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all hover:scale-105 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-black group' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300 hover:bg-white group'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-white dark:group-hover:text-white group-hover:text-black transition-colors"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                    </a>

                    {/* Instagram */}
                    <a href="https://www.instagram.com/whos_alaric_" target="_blank" rel="noopener noreferrer" className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all hover:scale-105 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 hover:border-pink-500/50 hover:bg-pink-900/10 group' : 'bg-zinc-50 border-zinc-100 hover:border-pink-200 hover:bg-pink-50 group'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-[#E4405F] transition-colors"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    </a>

                    {/* Mail */}
                    <a href="mailto:mr.alaric.verse@gmail.com" className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all hover:scale-105 ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-900/10 group' : 'bg-zinc-50 border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 group'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-emerald-500 transition-colors"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <main className="px-5 md:px-24 pt-8 md:pt-12 pb-56 max-w-5xl mx-auto space-y-12 md:space-y-20">
              <header className="mb-12 md:mb-16 pt-8 md:pt-12 text-center relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Blob Icon */}
                <div className="relative mb-6 group cursor-default">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="relative w-24 h-20 bg-[#00e673] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all duration-500 hover:rotate-3 hover:scale-105">
                    <div className="text-black transform scale-110">
                      <CodeIcon />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -right-2 top-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#fefefe] text-zinc-800 text-[10px] font-medium px-1.5 py-0.5 rounded border border-zinc-200 pointer-events-none whitespace-nowrap shadow-sm">
                      Minimize
                    </div>
                  </div>
                </div>

                <h2 className={`text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                  Architect your vision.
                </h2>

                <div className="space-y-6 md:space-y-8 w-full">
                  <div className="space-y-4 md:space-y-6">
                    <p className={`text-xl md:text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-900'}`}>
                      I'm your <span className="inline-block px-4 py-1 bg-[#dbece5] dark:bg-[#00e673]/20 text-[#0f5132] dark:text-[#00e673] rounded-full text-lg md:text-2xl align-middle shadow-sm">GitHub repo buddy.</span>
                    </p>
                    <p className={`text-sm md:text-lg font-medium tracking-tight leading-relaxed max-w-2xl mx-auto ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Find precision-filtered signal for your side-hustle, academic research, or production workloads. Zero noise.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <div className={`flex items-center gap-2 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-100 text-zinc-500 shadow-sm'}`}>
                      <GlobeIcon /> Real-time
                    </div>
                    <div className={`flex items-center gap-2 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-100 text-zinc-500 shadow-sm'}`}>
                      <SparkleIcon /> Resource Finder
                    </div>
                  </div>
                </div>
              </header>

              <section className="w-full max-w-4xl mx-auto mb-16 md:mb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                <h4 className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-widest text-center mb-6 md:mb-8 flex items-center justify-center gap-3">
                  <div className="h-px w-8 bg-zinc-800"></div>
                  Examples Explorations
                  <div className="h-px w-8 bg-zinc-800"></div>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {examples.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(example.prompt)}
                      className={`group p-5 md:p-6 rounded-2xl md:rounded-3xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden shadow-sm hover:shadow-md ${theme === 'dark'
                        ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-10 group-hover:opacity-25 transition-opacity duration-500 ${example.color === 'emerald' ? 'bg-emerald-500' :
                        example.color === 'blue' ? 'bg-blue-500' :
                          example.color === 'purple' ? 'bg-purple-500' :
                            example.color === 'pink' ? 'bg-pink-500' : 'bg-cyan-500'
                        }`}></div>

                      <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-opacity-10 backdrop-blur-sm ${example.color === 'emerald' ? 'text-emerald-500 bg-emerald-500' :
                            example.color === 'blue' ? 'text-blue-500 bg-blue-500' :
                              example.color === 'purple' ? 'text-purple-500 bg-purple-500' :
                                example.color === 'pink' ? 'text-pink-500 bg-pink-500' :
                                  'text-cyan-500 bg-cyan-500'
                            }`}>
                            {example.title}
                          </span>
                          <div className={`opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </div>
                        </div>
                        <p className={`text-sm md:text-[15px] font-bold leading-normal tracking-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>
                          {example.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                <section className="space-y-4 md:space-y-6">
                  <h4 className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest px-2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div> Domains
                  </h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {DISCOVERY_OPTIONS.categories.map(opt => (
                      <button key={opt.id} onClick={() => toggleSelection(opt.id)} className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left flex items-center gap-3 md:gap-4 group/opt ${selections.includes(opt.id) ? 'bg-emerald-500/10 border-emerald-500/50' : (theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm')}`}>
                        <span className="text-xl md:text-2xl transition-transform group-hover/opt:scale-125">{opt.icon}</span>
                        <div className="flex-1 truncate">
                          <p className={`text-xs md:text-sm font-bold ${selections.includes(opt.id) ? 'text-emerald-400' : ''}`}>{opt.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-4 md:space-y-6">
                  <h4 className="text-[9px] md:text-[10px] font-black text-cyan-500 uppercase tracking-widest px-2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-cyan-500"></div> Tech
                  </h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {DISCOVERY_OPTIONS.tech.map(opt => (
                      <button key={opt.id} onClick={() => toggleSelection(opt.id)} className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left flex items-center gap-3 md:gap-4 group/opt ${selections.includes(opt.id) ? 'bg-cyan-500/10 border-cyan-500/50' : (theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm')}`}>
                        <span className="text-xl md:text-2xl transition-transform group-hover/opt:scale-125">{opt.icon}</span>
                        <div className="flex-1 truncate">
                          <p className={`text-xs md:text-sm font-bold ${selections.includes(opt.id) ? 'text-cyan-400' : ''}`}>{opt.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="space-y-4 md:space-y-6">
                  <h4 className="text-[9px] md:text-[10px] font-black text-purple-500 uppercase tracking-widest px-2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-500"></div> Filtering
                  </h4>
                  <div className="space-y-2.5 md:space-y-3">
                    {DISCOVERY_OPTIONS.constraints.map(opt => (
                      <button key={opt.id} onClick={() => toggleSelection(opt.id)} className={`w-full p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all text-left flex items-center gap-3 md:gap-4 group/opt ${selections.includes(opt.id) ? 'bg-purple-500/10 border-purple-500/50' : (theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-100 hover:border-zinc-200 shadow-sm')}`}>
                        <span className="text-xl md:text-2xl transition-transform group-hover/opt:scale-125">{opt.icon}</span>
                        <div className="flex-1 truncate">
                          <p className={`text-xs md:text-sm font-bold ${selections.includes(opt.id) ? 'text-purple-400' : ''}`}>{opt.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </main>
          ) : (
            <main className="px-5 md:px-24 pt-8 md:pt-12 pb-56 max-w-5xl mx-auto space-y-12 md:space-y-20">
              {messages.map((message) => (
                <div key={message.id} id={`msg-${message.id}`} className="animate-in fade-in slide-in-from-bottom-6 duration-500 scroll-mt-24">
                  <div className="flex flex-col gap-4 md:gap-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${message.role === 'user' ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500 text-black'}`}>
                        {message.role === 'user' ? <UserIcon /> : <BotIcon />}
                      </div>
                      {message.role === 'assistant' && (
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mono text-zinc-500">ASSISTANT</span>
                      )}
                    </div>
                    <div className="pl-0 md:pl-12">
                      {message.role === 'user' ? (
                        <h3 className="text-xl md:text-3xl font-bold tracking-tight leading-tight">{message.content}</h3>
                      ) : (
                        <div className="space-y-8 md:space-y-10">
                          {message.isThinking ? (
                            <div className="flex items-center gap-3 md:gap-4 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10">
                              <div className="w-4 h-4 md:w-5 md:h-5 border-2 md:border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                              <span className="font-bold text-emerald-500/80 uppercase text-[10px] md:text-xs tracking-widest mono">Browsing Logs & git history...</span>

                              <button
                                onClick={handleStop}
                                className="ml-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 border border-red-500/20 hover:border-red-500 shadow-sm transition-all"
                              >
                                Stop
                              </button>
                            </div>
                          ) : (
                            <>
                              <FormattedResponse text={message.content} repos={message.repos} onToggleSave={toggleSaveRepo} savedUris={savedUris} theme={theme} />

                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-20" />
            </main>
          )}
        </div>

        {!showSettings && (
          <div className={`fixed bottom-0 left-0 right-0 lg:left-80 z-[70] p-4 lg:px-6 lg:pb-8 ${theme === 'dark' ? 'bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent' : 'bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent'}`}>
            <div className="max-w-2xl mx-auto flex flex-col items-center w-full">
              <form onSubmit={handleSubmit} className={`w-full relative group flex flex-col p-2 md:p-3 rounded-2xl md:rounded-3xl border transition-all duration-300 ${theme === 'dark' ? 'bg-zinc-900/40 border-zinc-800 focus-within:border-emerald-500/50 focus-within:bg-zinc-900 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)] focus-within:ring-1 focus-within:ring-emerald-500/20' : 'bg-white border-zinc-200 focus-within:border-emerald-500/40 shadow-sm focus-within:shadow-xl'}`}>
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="flex items-start gap-2 relative z-10">
                  <div className={`pl-2 pt-2 transition-colors duration-300 ${theme === 'dark' ? 'text-zinc-600 group-focus-within:text-emerald-400' : 'text-zinc-400 group-focus-within:text-emerald-600'}`}>
                    <TerminalIcon />
                  </div>
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder={messages.length === 0 ? placeholderText : "Review code, generate docs, or refactor..."}
                    className={`flex-1 bg-transparent py-2.5 px-2 text-sm md:text-base outline-none resize-none min-h-[50px] max-h-[160px] overflow-y-auto font-medium transition-colors ${theme === 'dark' ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-900 placeholder:text-zinc-400'}`}
                    disabled={isSearching}
                    rows={1}
                    maxLength={500}
                    spellCheck="false"
                  />
                </div>
                <div className="flex items-center justify-between px-2 pb-1 pt-2">
                  <div className="flex gap-2 items-center">
                    {selections.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full shrink-0 transition-all hover:bg-emerald-500/20 cursor-default">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full status-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{selections.length} Selected</span>
                      </div>
                    )}
                    {messages.length > 0 && (
                      <button type="button" onClick={startNewChat} className={`p-2 rounded-xl transition-all hover:scale-110 ${theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`} title="New Chat">
                        <PlusIcon />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || (!input.trim() && messages.length === 0 && selections.length < MIN_SELECTIONS)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isSearching
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.4)] active:scale-95'}`}
                  >
                    {isSearching ? (
                      <>
                        <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        <span>Processing</span>
                      </>
                    ) : (
                      <>
                        <span>Generate</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}



export default function App() {
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <AuthProvider>
      <AuthConsumer showLogin={showLogin} setShowLogin={setShowLogin} />
    </AuthProvider>
  );
}

// Helper for Auth Navigation
const pushAuthState = (isLogin: boolean) => {
  const url = new URL(window.location.href);
  if (isLogin) {
    url.pathname = '/login';
  } else {
    url.pathname = '/';
  }
  window.history.pushState({}, '', url.toString());
};

function AuthConsumer({ showLogin, setShowLogin }: { showLogin: boolean, setShowLogin: (v: boolean) => void }) {
  const { user, loading } = useAuth();

  // Auth Back Navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/') {
        setShowLogin(false);
      } else if (window.location.pathname === '/login') {
        setShowLogin(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setShowLogin]);

  if (loading) return <LoadingScreen />;

  if (user) {
    return <GitPulseApp />;
  }

  if (showLogin) {
    return <Login onBack={() => {
      setShowLogin(false);
      pushAuthState(false);
    }} />;
  }

  const handleShowLogin = () => {
    setShowLogin(true);
    pushAuthState(true);
  };

  return (
    <LandingPage
      onLoginClick={handleShowLogin}
      onStartFreeClick={handleShowLogin}
    />
  );
};






























































































































