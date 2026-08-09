import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  motionKey?: React.Key;
}

/**
 * PageTransition — AnimatePresence helper for page/view transitions.
 * Wraps a keyed child so switching keys triggers enter/exit animations.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, motionKey }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={motionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
