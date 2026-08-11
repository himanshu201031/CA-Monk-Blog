import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface TypewriterProps {
  text: string;
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Delay before typing starts, in ms. */
  delay?: number;
}

/**
 * Typewriter — types `text` character-by-character once it scrolls into view,
 * ending on a blinking caret. The full text is exposed via aria-label, and the
 * animated slice is aria-hidden so screen readers get the complete sentence.
 * Respects `prefers-reduced-motion`: users with reduced motion see the full
 * text immediately, no typing.
 */
export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  className,
  speed = 38,
  delay = 0,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [chars, setChars] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setChars(text.length);
      return;
    }
    started.current = true;
    let i = 0;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setChars(i);
        if (i >= text.length && interval) window.clearInterval(interval);
      }, speed);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [inView, text, speed, delay]);

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{text.slice(0, chars)}</span>
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-pulse rounded-full bg-[#4c44d4]"
      />
    </p>
  );
};

export default Typewriter;
