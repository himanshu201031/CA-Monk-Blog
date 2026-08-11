import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home';
import BlogsPage from './components/BlogsPage';
import BlogEditor from './components/BlogEditor';
import NotFound from './components/NotFound';
import UserCursor from './components/ui/user-cursor';
import Loader from './components/Loader';
import { Curtain } from './animations/CurtainTransition';
import { ThemeProvider } from './lib/theme';

/**
 * CurtainView — wraps a routed page with the dark curtain wipe. There is
 * deliberately NO view-level opacity fade: the curtain is the only transition,
 * and it stays fully opaque so the white page can never show through it.
 * `playing` is false only for the very first page, which mounts hidden behind
 * the curtain while the entrance loader slides away; it flips true once the
 * loader has fully exited, and the curtain sweeps down to reveal the page.
 */
const CurtainView: React.FC<{ children: React.ReactNode; playing: boolean }> = ({
  children,
  playing,
}) => (
  <>
    {children}
    <Curtain playing={playing} />
  </>
);

const AnimatedRoutes: React.FC<{ playing: boolean }> = ({ playing }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<CurtainView playing={playing}><Home /></CurtainView>} />
        <Route path="/blogs" element={<CurtainView playing={playing}><BlogsPage /></CurtainView>} />
        <Route path="/blogs/new" element={<CurtainView playing={playing}><BlogEditor /></CurtainView>} />
        <Route path="/blogs/:id/edit" element={<CurtainView playing={playing}><BlogEditor /></CurtainView>} />
        <Route path="*" element={<CurtainView playing={playing}><NotFound /></CurtainView>} />
      </Routes>
    </AnimatePresence>
  );
};

const LOADER_SEEN_KEY = 'blogify:loader:seen';

const App: React.FC = () => {
  // The loader plays only once per browser session — after the first load it
  // is skipped so the app (and its dark curtain) never appear again on
  // reloads or back/forward navigation.
  const [loaderSeen] = useState(() => {
    try {
      return sessionStorage.getItem(LOADER_SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(!loaderSeen);
  const [revealed, setRevealed] = useState(loaderSeen);

  return (
    <ThemeProvider>
      <UserCursor />
      {/* onExitComplete fires after the loader has fully slid away; only then
          do we let the first page's curtain sweep down and reveal it. */}
      <AnimatePresence onExitComplete={() => setRevealed(true)}>
        {loading && (
          <Loader
            key="loader"
            onDone={() => {
              try {
                sessionStorage.setItem(LOADER_SEEN_KEY, '1');
              } catch {
                /* ignore */
              }
              setLoading(false);
            }}
          />
        )}
      </AnimatePresence>
      {/* The routes mount as soon as the loader's counter finishes, so the
          first page is already hidden behind its dark curtain while the white
          loader is still sliding up — no white flash between them. */}
      {!loading && (
        <BrowserRouter>
          <AnimatedRoutes playing={revealed} />
        </BrowserRouter>
      )}
    </ThemeProvider>
  );
};

export default App;
