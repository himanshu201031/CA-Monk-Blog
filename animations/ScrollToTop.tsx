import React, { useEffect, useState } from 'react';

/**
 * A floating scroll-to-top button that appears after scrolling down.
 * Uses the Lenis instance (if present) for smooth scrolling, else window.scrollTo.
 */
export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    const lenis = (window as any).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      className={`fixed bottom-6 right-6 z-[9997] flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-(--brand) text-white shadow-[0_8px_24px] shadow-(--brand)/35 transition-all duration-300 hover:-translate-y-[3px] hover:bg-(--brand-strong) ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleClick}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};
