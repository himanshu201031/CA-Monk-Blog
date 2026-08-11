import React from 'react';

interface WordCountProps {
  content?: string;
}

/**
 * Displays an estimated word count and read time for a piece of content.
 */
export const WordCount: React.FC<WordCountProps> = ({ content = '' }) => {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--brand)/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-(--brand)">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      {words} words · {readTime} min read
    </span>
  );
};
