import React, { useEffect, useState } from 'react';

/**
 * A fixed reading-progress bar at the top of the page.
 * Width reflects how far the user has scrolled down the page.
 */
export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="reading-progress"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
};
