import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const BRAND = "BLOGIFY";

interface LoaderProps {
  /** Called once the loader has finished counting, just before it exits. */
  onDone?: () => void;
  /** Total load time in ms (shorter when the user prefers reduced motion). */
  duration?: number;
}

/**
 * Loader — a branded full-screen entrance: staggered wordmark, a large
 * percentage counter, and a glowing progress bar. Slides up out of
 * the way when removed via AnimatePresence.
 */
const Loader: React.FC<LoaderProps> = ({ onDone, duration = 1300 }) => {
  const reduced = useReducedMotion();
  const total = reduced ? 700 : duration;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      setProgress(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  useEffect(() => {
    const timer = setTimeout(() => onDone?.(), total + 150);
    return () => clearTimeout(timer);
  }, [onDone, total]);

  return (
    <motion.div
      aria-label="Loading"
      role="status"
      exit={{ y: "-100%", transition: { duration: 0.7, ease: EASE } }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-background"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#4c44d4]/20 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#8363f9]/20 blur-3xl animate-float-slower" />
      </div>

      {/* Wordmark */}
      <div className="flex gap-1.5 overflow-hidden">
        {BRAND.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 + i * 0.04, duration: 0.5, ease: EASE }}
            className="text-sm font-black tracking-[0.35em] text-slate-900"
          >
            {ch}
          </motion.span>
        ))}
      </div>

      {/* Large percentage counter */}
      <div className="mt-8 flex items-baseline">
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-display text-6xl font-black leading-none tabular-nums text-[#4c44d4] sm:text-7xl"
        >
          {progress}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="ml-1 text-3xl font-black leading-none text-[#4c44d4] sm:text-4xl"
        >
          %
        </motion.span>
      </div>

      {/* Glowing progress bar */}
      <div className="mt-6 h-[3px] w-52 overflow-hidden rounded-full bg-slate-200 sm:w-64">
        <div
          className="h-full rounded-full bg-[#4c44d4] shadow-[0_0_18px_rgba(76,68,212,0.45)] transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="mt-5 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500"
      >
        Preparing your stories
      </motion.span>
    </motion.div>
  );
};

export default Loader;
