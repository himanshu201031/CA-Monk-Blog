import React from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

/**
 * FadeIn — Framer-Motion based fade-in / fade-out wrapper.
 * Animates opacity (and optional vertical offset) on mount.
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  y = 24,
  className,
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -y }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
