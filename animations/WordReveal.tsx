import React, { useEffect, useMemo, useRef, useState } from 'react';

interface WordRevealProps {
  /** Paragraphs of prose; words light up one-by-one as the reader scrolls. */
  segments: string[];
  /** Scroll distance (in vh) the reveal plays out over. */
  scrollLength?: number;
  /** Extra classes for the section wrapper. */
  className?: string;
  /** Per-word styling — receives whether the word is currently revealed. */
  wordClassName?: (revealed: boolean) => string;
}

/**
 * WordReveal — a scroll-linked "slow reading" reveal: the text sits inside a
 * tall scroll zone and words light up one at a time as the page passes an
 * eye-level line, with RAF-smoothed easing so it feels cinematic.
 */
export const WordReveal: React.FC<WordRevealProps> = ({
  segments,
  scrollLength = 180,
  className,
  wordClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);

  const allWords = useMemo(() => segments.flatMap((s) => s.split(' ')), [segments]);
  const total = allWords.length;

  useEffect(() => {
    let rafId: number | null = null;
    let targetProgress = 0;
    let currentProgress = 0;

    const smoothScroll = () => {
      const difference = targetProgress - currentProgress;
      currentProgress += difference * 0.12;

      if (Math.abs(targetProgress - currentProgress) > 0.001) {
        setRevealed(Math.floor(currentProgress * total));
        rafId = requestAnimationFrame(smoothScroll);
      } else {
        setRevealed(Math.floor(targetProgress * total));
      }
    };

    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const eyeLevel = window.innerHeight * 0.62;

      const animationStart = rect.top + window.scrollY - eyeLevel;
      const animationEnd = rect.top + window.scrollY + rect.height - eyeLevel;
      const scrollDistance = animationEnd - animationStart;
      const currentScroll = window.scrollY;

      let progress = (currentScroll - animationStart) / scrollDistance;
      targetProgress = Math.max(0, Math.min(1, progress));

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(smoothScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [total]);

  let wordIndex = 0;

  return (
    <div className={className}>
      <div ref={containerRef} style={{ minHeight: `${scrollLength}vh` }}>
        <div className="space-y-8">
          {segments.map((segment, segmentIndex) => {
            const words = segment.split(' ');
            const segmentStartIndex = wordIndex;
            wordIndex += words.length;

            return (
              <p
                key={segmentIndex}
                className="mx-auto max-w-3xl text-center text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl"
              >
                {words.map((word, i) => {
                  const currentWordIndex = segmentStartIndex + i;
                  const isRevealed = currentWordIndex < revealed;
                  const cls = wordClassName
                    ? wordClassName(isRevealed)
                    : isRevealed
                      ? 'text-slate-900'
                      : 'text-slate-300';
                  return (
                    <span
                      key={i}
                      className={`transition-all duration-300 ${cls}`}
                      style={{ opacity: isRevealed ? 1 : 0.45 }}
                    >
                      {word}{' '}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WordReveal;
