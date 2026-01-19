
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBlogs, updateBlog, deleteBlog } from './api';
import { BlogCard } from './components/BlogCard';
import { BlogDetail } from './components/BlogDetail';
import { CreateBlogForm } from './components/CreateBlogForm';
import { Blog } from './types';

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(1);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
  });

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingBlog) {
      const base64 = await toBase64(file);
      setEditingBlog({ ...editingBlog, coverImage: base64 });
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, updates: Partial<Blog> }) => updateBlog(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', editingBlog?.id] });
      setEditingBlog(null);
      setUpdateError(null);
    },
    onError: (error: any) => {
      setUpdateError(error.message || "We encountered an issue updating this article. Please verify your connection.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      if (selectedBlogId === deletingId) {
        setSelectedBlogId(null);
      }
      setDeletingId(null);
    },
    onError: (error: any) => {
      alert("Error deleting blog: " + error.message);
      setDeletingId(null);
    }
  });

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;
    setUpdateError(null);
    updateMutation.mutate({ 
      id: editingBlog.id, 
      updates: editingBlog 
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 px-6 lg:px-12 py-5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4c44d4] rounded flex items-center justify-center text-white font-black text-xs">M</div>
            <span className="font-black text-lg tracking-tighter">CA MONK</span>
          </div>
          <div className="hidden lg:flex gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <a href="#" className="hover:text-[#4c44d4]">Tools</a>
            <a href="#" className="hover:text-[#4c44d4]">Practice</a>
            <a href="#" className="hover:text-[#4c44d4]">Events</a>
            <a href="#" className="hover:text-[#4c44d4]">Job Board</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCreating(true)}
            className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Create Post
          </button>
          <button className="px-5 py-2 bg-[#4c44d4] text-white rounded-lg text-xs font-bold hover:bg-[#3b35a8] transition-colors shadow-lg shadow-blue-200">
            Profile
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-white py-16 lg:py-24 text-center px-6 border-b border-slate-50">
        <h1 className="text-4xl lg:text-[52px] font-[900] text-[#1a1a1a] mb-4 tracking-tighter">CA Monk Blog</h1>
        <p className="max-w-xl mx-auto text-slate-500 leading-relaxed font-medium text-sm">
          Stay updated with the latest trends in finance, accounting, and career growth.
        </p>
      </header>

      {/* Main Layout */}
      <main className="max-w-[1280px] mx-auto w-full flex flex-col lg:flex-row gap-8 px-6 pb-20 mt-12">
        <aside className="w-full lg:w-[340px] shrink-0">
          <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4c44d4]"></span>
            Latest Articles
          </h2>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading articles...</div>
            ) : Array.isArray(blogs) && blogs.length > 0 ? (
              blogs.map(blog => (
                <BlogCard 
                  key={blog.id}
                  blog={blog}
                  isActive={selectedBlogId === blog.id}
                  onClick={() => setSelectedBlogId(blog.id)}
                  onEdit={(b) => { setEditingBlog(b); setUpdateError(null); }}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">No articles found</div>
            )}
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <BlogDetail id={selectedBlogId} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#111111] text-white py-16 px-12 mt-auto text-center md:text-left">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-black">M</div>
            <span className="font-black text-lg tracking-tighter">CA MONK</span>
          </div>
          <p className="text-slate-400 text-[11px] max-w-xs">Empowering the next generation of financial leaders with tools and community.</p>
        </div>
      </footer>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[32px] p-10 max-h-[90vh] overflow-y-auto shadow-2xl">
             <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Publish Story</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Share your insights</p>
                </div>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-xl">✕</button>
             </div>
             <CreateBlogForm onFinish={() => setIsCreating(false)} />
          </div>
        </div>
      )}

      {/* Refined Edit Modal */}
      {editingBlog && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
             <div className="p-10 md:p-14 overflow-y-auto max-h-[85vh] custom-scrollbar">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-[900] text-slate-900 tracking-tighter">Edit Article</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Professional Revision</p>
                  </div>
                  <button onClick={() => { setEditingBlog(null); setUpdateError(null); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {updateError && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-[24px] flex items-start gap-4 animate-in fade-in">
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Sync Error</h4>
                      <p className="text-xs font-medium text-red-600">{updateError}</p>
                    </div>
                    <button onClick={() => setUpdateError(null)} className="text-red-300 hover:text-red-500 transition-colors">✕</button>
                  </div>
                )}

                <form onSubmit={handleUpdateSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    <div className="md:col-span-7 space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Headline</label>
                        <input 
                          className="w-full px-0 py-3 bg-transparent border-b-2 border-slate-100 focus:border-[#4c44d4] transition-all text-xl font-extrabold text-slate-900 outline-none" 
                          value={editingBlog.title} 
                          onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} 
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Summary</label>
                        <textarea 
                          className="w-full px-0 py-3 bg-transparent border-b-2 border-slate-100 focus:border-[#4c44d4] transition-all text-sm font-medium text-slate-500 outline-none h-20 resize-none" 
                          value={editingBlog.description} 
                          onChange={e => setEditingBlog({...editingBlog, description: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 block">Media Asset</label>
                      <div className="relative aspect-video rounded-[24px] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 group">
                        <img src={editingBlog.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">Click to Change</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleEditImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Full Narrative</label>
                    <textarea 
                      className="w-full p-8 bg-slate-50 rounded-[24px] text-sm font-medium text-slate-600 min-h-[300px] border border-transparent focus:border-[#4c44d4] focus:bg-white outline-none leading-relaxed transition-all" 
                      value={editingBlog.content} 
                      onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} 
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <button type="button" onClick={() => setEditingBlog(null)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Discard</button>
                    <button 
                      type="submit" 
                      disabled={updateMutation.isPending}
                      className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#4c44d4] transition-all disabled:opacity-50 flex items-center gap-3"
                    >
                      {updateMutation.isPending && (
                        <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      )}
                      Update Post
                    </button>
                  </div>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-10 text-center shadow-2xl">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2">Delete article?</h3>
             <p className="text-slate-500 text-xs font-medium mb-8">This action is irreversible.</p>
             <div className="flex gap-4">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deletingId)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">Delete</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
