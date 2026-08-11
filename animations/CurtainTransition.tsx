import { motion, type Variants } from 'framer-motion';

const COLS = 5;

/**
 * Curtain — a full-screen wipe of `COLS` vertical columns (horizontal bands
 * on mobile). Rendered inside each route view: when a route unmounts its
 * curtain covers the old page (drop from top, right-to-left stagger); when
 * the next route mounts its curtain sweeps away (slide down, left-to-right
 * stagger) to reveal it. Driven by AnimatePresence mode="wait".
 */
const bannerVariants: Variants = {
  initial: {
    y: '0%',
  },
  animate: (i: number) => ({
    y: '100%',
    transition: {
      duration: 0.75,
      ease: 'circOut',
      delay: i * 0.08,
    },
  }),
  exit: (i: number) => ({
    y: ['-100%', '0%'],
    transition: {
      duration: 0.75,
      ease: 'circOut',
      delay: (COLS - i) * 0.08,
    },
  }),
};

/**
 * Curtain — a full-screen wipe of `COLS` vertical columns (horizontal bands
 * on mobile). When `playing` is true the panels sweep down to reveal the page
 * underneath (used for normal navigation). When false they hold at full cover
 * — the first page mounts hidden behind the curtain, and it only sweeps away
 * once `playing` flips true (after the entrance loader has fully exited), so
 * the loader never overlaps the reveal.
 */
export const Curtain = ({ playing = true }: { playing?: boolean }) => (
  <div aria-hidden className="pointer-events-none fixed inset-0 z-[250] flex flex-col lg:flex-row">
    {Array.from({ length: COLS }).map((_, i) => (
      <motion.div
        key={i}
        custom={i}
        variants={bannerVariants}
        initial="initial"
        animate={playing ? "animate" : "initial"}
        exit="exit"
        className="h-full w-full border-white/10 bg-slate-900 last:border-r-0 lg:h-screen lg:w-1/5 lg:border-r"
      />
    ))}
  </div>
);
