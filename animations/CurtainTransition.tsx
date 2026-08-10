import { motion } from "framer-motion";

const COLS = 5;
const PANEL_EASE: [number, number, number, number] = [0.6, 0.05, 0.01, 0.9];

interface CurtainTransitionProps {
  /**
   * "cover" — panels drop in from the top (right-to-left stagger), hiding the
   * current page. "reveal" — panels slide down off-screen (left-to-right
   * stagger), uncovering the new page beneath.
   */
  phase: "cover" | "reveal";
  /** Fired once every panel has finished covering the screen. */
  onCovered?: () => void;
  /** Fired once every panel has finished revealing the new page. */
  onRevealed?: () => void;
}

/**
 * CurtainTransition — a full-screen wipe made of `COLS` vertical columns
 * (horizontal bands on mobile). It covers the viewport with a staggered
 * top-down sweep, lets the app swap the page underneath, then sweeps the
 * panels away to reveal it.
 */
export const CurtainTransition = ({ phase, onCovered, onRevealed }: CurtainTransitionProps) => {
  const covering = phase === "cover";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[250] flex flex-col lg:flex-row">
      {Array.from({ length: COLS }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: covering ? "-100%" : "0%" }}
          animate={{ y: covering ? "0%" : "100%" }}
          transition={{
            duration: 0.65,
            ease: PANEL_EASE,
            delay: covering ? (COLS - i) * 0.07 : i * 0.07,
          }}
          onAnimationComplete={() => {
            // Cover finishes when the LAST panel lands (i = 0, biggest delay);
            // reveal finishes when the LAST panel departs (i = COLS - 1).
            if (covering && i === 0) onCovered?.();
            if (!covering && i === COLS - 1) onRevealed?.();
          }}
          className="h-full w-full border-white/10 bg-[#0b0d16] lg:h-screen lg:w-1/5 lg:border-r last:border-r-0"
        />
      ))}
    </div>
  );
};
