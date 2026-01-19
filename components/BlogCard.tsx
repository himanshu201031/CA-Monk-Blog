
import React from 'react';
import { Blog } from '../types';

interface BlogCardProps {
  blog: Blog;
  isActive: boolean;
  onClick: () => void;
  onEdit: (blog: Blog) => void;
  onDelete: (id: number) => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, isActive, onClick, onEdit, onDelete }) => {
  const getIcon = (cat: string) => {
    const c = cat.toUpperCase();
    if (c.includes('FINANCE')) return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
    if (c.includes('CAREER')) return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
    return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" /></svg>;
  };

  return (
    <div 
      onClick={onClick}
      className={`group relative p-6 bg-white border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50/80 ${
        isActive ? 'border-l-4 border-l-[#4c44d4] bg-slate-50/50 shadow-inner' : 'border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className={`${isActive ? 'text-[#4c44d4]' : 'text-slate-400'}`}>
            {getIcon(blog.category[0] || '')}
          </span>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {blog.category[0] || 'GENERAL'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Recent</span>
      </div>

      <h3 className={`text-[13px] font-black leading-tight mb-2 transition-colors ${isActive ? 'text-[#4c44d4]' : 'text-slate-900 group-hover:text-[#4c44d4]'}`}>
        {blog.title}
      </h3>
      
      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4 font-medium">
        {blog.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(blog); }}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-[#4c44d4] hover:bg-white rounded-lg border border-slate-100 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(blog.id); }}
            className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-slate-100 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};
