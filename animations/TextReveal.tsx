import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
type TextRevealTag = keyof React.JSX.IntrinsicElements;

interface TextRevealProps {
  text: string;
  as?: TextRevealTag;
  className?: string;
  stagger?: number;
  delay?: number;
}

/**
 * TextReveal — GSAP-powered word-by-word text reveal animation.
 * Each word is wrapped in an overflow-hidden span and slides up into place.
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  as = 'h1',
  className,
  stagger = 0.04,
  delay = 0,
}) => {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as React.ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll('.text-reveal-word > span');
    const ctx = gsap.context(() => {
      gsap.to(words, {
        y: 0,
        duration: 0.7,
        stagger,
        delay,
        ease: 'power3.out',
      });
    }, el);

    return () => ctx.revert();
  }, [text, stagger, delay]);

  const words = text.split(' ');

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="text-reveal-word mr-[0.25em]">
          <span>{word}</span>
        </span>
      ))}
    </Tag>
  );
};

export default TextReveal;
