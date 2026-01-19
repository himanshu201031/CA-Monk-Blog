
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBlogById } from '../api';

interface BlogDetailProps {
  id: number | null;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ id }) => {
  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => fetchBlogById(id!),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 p-12 text-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Select an Article</h3>
          <p className="text-sm text-slate-500">Read the latest insights from CA Monk experts.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !blog) return <div className="p-12 animate-pulse">Loading story...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-12">
      <img src={blog?.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200'} className="w-full h-[450px] object-cover" alt="" />
      
      <div className="p-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-black text-[#4c44d4] uppercase tracking-widest">{blog?.category?.[0] || 'GENERAL'}</span>
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-[11px] font-bold text-slate-400">5 min read</span>
        </div>

        <h1 className="text-4xl font-extrabold text-[#1a1a1a] mb-6 leading-tight">
          {blog?.title || 'Untitled'}
        </h1>

        <button className="flex items-center gap-2 bg-[#4c44d4] text-white px-4 py-2 rounded-lg text-xs font-bold mb-8 hover:bg-[#3b35a8] transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
          Share Article
        </button>

        <div className="grid grid-cols-3 gap-0 border border-slate-100 rounded-xl mb-10 text-center overflow-hidden">
          <div className="py-4 border-r border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Category</p>
            <p className="text-xs font-bold text-slate-800">{blog?.category?.join(' & ') || 'GENERAL'}</p>
          </div>
          <div className="py-4 border-r border-slate-100 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Read Time</p>
            <p className="text-xs font-bold text-slate-800">5 Mins</p>
          </div>
          <div className="py-4 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Date</p>
            <p className="text-xs font-bold text-slate-800">Oct 24, 2023</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-700 leading-relaxed mb-8">
            {blog?.description || 'No description available'}
          </p>
          
          <div className="pl-6 border-l-4 border-l-[#eef2ff] bg-[#f8faff] py-6 px-8 rounded-r-xl mb-10">
            <p className="text-[#312e81] font-medium italic leading-relaxed">
              "The accountant of the future will be a data scientist, a storyteller, and a strategic partner, all rolled into one."
            </p>
          </div>

          <div className="text-slate-600 leading-relaxed space-y-6 whitespace-pre-wrap">
            {blog?.content || 'No content available'}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?u=arjun" className="w-10 h-10 rounded-full" alt="" />
            <div>
              <p className="text-xs font-bold text-slate-900">Written by Arjun Mehta</p>
              <p className="text-[10px] text-slate-400">Senior Financial Analyst</p>
            </div>
          </div>
          <div className="flex gap-4 text-slate-400">
             <button className="hover:text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg></button>
             <button className="hover:text-blue-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );
};
