
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBlog } from '../api';
import { CreateBlogDto } from '../types';

interface Props {
  onFinish?: () => void;
}

export const CreateBlogForm: React.FC<Props> = ({ onFinish }) => {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateBlogDto>({
    title: '',
    description: '',
    content: '',
    category: ['GENERAL'],
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200'
  });

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await toBase64(file);
      setPreview(base64);
      setFormData({ ...formData, coverImage: base64 });
    }
  };

  const mutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onFinish?.();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              type="text"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4c44d4]/10 focus:border-[#4c44d4] transition-all text-sm font-bold"
              placeholder="What's the title?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary</label>
            <input 
              type="text"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4c44d4]/10 focus:border-[#4c44d4] transition-all text-sm font-medium"
              placeholder="Short description..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cover Image</label>
          <div className="relative group h-[124px]">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            <div className={`w-full h-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center bg-slate-50 overflow-hidden ${preview ? 'border-transparent' : 'border-slate-200 group-hover:border-[#4c44d4] group-hover:bg-slate-100'}`}>
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Upload Image</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Narrative</label>
        <textarea 
          className="w-full px-5 py-3.5 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4c44d4]/10 focus:border-[#4c44d4] transition-all text-sm min-h-[160px] resize-none leading-relaxed"
          placeholder="Write your story..."
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          required
        />
      </div>

      <button 
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-[#4c44d4] text-white font-black py-4 rounded-xl hover:bg-[#3b35a8] transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-blue-100"
      >
        {mutation.isPending ? 'Publishing...' : 'Publish Insight'}
      </button>
    </form>
  );
};
