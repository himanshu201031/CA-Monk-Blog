import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A search input used to filter the blog list by title/description/category.
 */
export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <svg
        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles..."
        aria-label="Search articles"
        className="blog-search w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-100 bg-white text-sm font-medium text-slate-700 outline-none focus:bg-white"
      />
    </div>
  );
};
