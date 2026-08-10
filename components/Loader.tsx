import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const BRAND = "BLOGIFY";

interface LoaderProps {
  /** Called once the loader has finished its show, just before it exits. */
  onDone?: () => void;
  /** Total load time in ms (shorter when the user prefers reduced motion). */
  duration?: number;
}

/**
 * Loader — a branded full-screen entrance: gradient brand tile with a
 * spinning ring, staggered wordmark, and an eased 0→100% progress counter.
 * Slides up out of the way when removed via AnimatePresence.
 */
const Loader: React.FC<LoaderProps> = ({ onDone, duration = 1100 }) => {
  const reduced = useReducedMotion();
  const total = reduced ? 650 : duration;
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
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-[#0b0d16]"
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#4c44d4]/20 blur-3xl animate-float-slow" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#8363f9]/20 blur-3xl animate-float-slower" />
      </div>

      {/* Brand tile */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#4c44d4] to-[#8363f9] text-2xl font-black text-white shadow-[0_20px_60px_rgba(76,68,212,0.5)]"
      >
        <span>B</span>
        {!reduced && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            className="pointer-events-none absolute -inset-2 rounded-[1.4rem] border-2 border-transparent border-t-[#a5b4fc]/90 border-r-[#8363f9]/40"
          />
        )}
      </motion.div>

      {/* Wordmark */}
      <div className="mt-6 flex gap-1.5 overflow-hidden">
        {BRAND.split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.22 + i * 0.045, duration: 0.5, ease: EASE }}
            className="text-sm font-black tracking-[0.35em] text-white"
          >
            {ch}
          </motion.span>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-6 h-[2px] w-44 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#4c44d4] to-[#8363f9]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="mt-3 font-mono text-[11px] tabular-nums tracking-[0.35em] text-slate-500">
        {progress}%
      </span>
    </motion.div>
  );
};

export default Loader;
