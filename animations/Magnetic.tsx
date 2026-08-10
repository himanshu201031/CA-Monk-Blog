import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Magnetic — wraps any element and makes it gently "stick" to the cursor:
 * the element translates toward the pointer while hovered and springs back
 * on leave. Pure decorative hover feedback (no layout impact).
 */
interface MagneticProps {
  children: React.ReactNode;
  /** How strongly the element follows the cursor (0 = off, 1 = full). */
  strength?: number;
  className?: string;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.3,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
