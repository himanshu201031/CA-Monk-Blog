import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './components/Home';
import BlogsPage from './components/BlogsPage';
import BlogEditor from './components/BlogEditor';
import NotFound from './components/NotFound';
import UserCursor from './components/ui/user-cursor';
import Loader from './components/Loader';
import { Curtain } from './animations/CurtainTransition';
import { ThemeProvider } from './lib/theme';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const viewMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.35, ease: EASE },
};

/** Wraps a routed page: view fade + the curtain wipe on enter/exit. */
const CurtainView: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div {...viewMotion}>
    {children}
    <Curtain />
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<CurtainView><Home /></CurtainView>} />
        <Route path="/blogs" element={<CurtainView><BlogsPage /></CurtainView>} />
        <Route path="/blogs/new" element={<CurtainView><BlogEditor /></CurtainView>} />
        <Route path="/blogs/:id/edit" element={<CurtainView><BlogEditor /></CurtainView>} />
        <Route path="*" element={<CurtainView><NotFound /></CurtainView>} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <ThemeProvider>
      <UserCursor />
      <AnimatePresence>{loading && <Loader key="loader" onDone={() => setLoading(false)} />}</AnimatePresence>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
