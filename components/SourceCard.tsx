
import React from 'react';
import { GroundingSource } from '../types';

interface SourceCardProps {
  source: GroundingSource;
  index: number;
  theme?: 'dark' | 'light';
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index, theme = 'dark' }) => {
  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex flex-col gap-1 p-3 border rounded-xl transition-colors w-48 shrink-0 shadow-sm ${theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-white' : 'bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-900'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Source {index + 1}</span>
        <img 
          src={`https://www.google.com/s2/favicons?domain=${new URL(source.uri).hostname}&sz=32`}
          alt="favicon"
          className="w-3 h-3 rounded-full"
        />
      </div>
      <h4 className={`text-xs font-semibold line-clamp-2 leading-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-800'}`}>
        {source.title}
      </h4>
      <p className="text-[10px] text-zinc-500 truncate">
        {new URL(source.uri).hostname}
      </p>
    </a>
  );
};
