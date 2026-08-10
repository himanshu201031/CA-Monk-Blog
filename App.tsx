import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './components/Home';
import BlogsPage from './components/BlogsPage';
import BlogEditor from './components/BlogEditor';
import UserCursor from './components/ui/user-cursor';
import Loader from './components/Loader';
import { CurtainTransition } from './animations/CurtainTransition';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface BlogNavOptions {
  category?: string;
  query?: string;
  searchFocus?: boolean;
  editingId?: number;
}

type View = 'home' | 'blogs' | 'editor';
type CurtainPhase = 'idle' | 'cover' | 'reveal';

const viewMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.35, ease: EASE },
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [options, setOptions] = useState<BlogNavOptions>({});
  const [loading, setLoading] = useState(true);
  const [curtain, setCurtain] = useState<CurtainPhase>('idle');
  const pendingRef = useRef<{ view: View; options: BlogNavOptions } | null>(null);

  // Any view change goes through the curtain: cover the screen, swap the
  // view underneath, then sweep the curtain away to reveal it.
  const navigate = (next: View, opts: BlogNavOptions = {}) => {
    if (curtain !== 'idle') return; // ignore clicks mid-transition
    pendingRef.current = { view: next, options: opts };
    setCurtain('cover');
  };

  const openBlogs = (opts: BlogNavOptions = {}) => navigate('blogs', opts);
  const openEditor = (opts: BlogNavOptions = {}) => navigate('editor', opts);
  const openHome = () => navigate('home');

  const handleCovered = () => {
    const pending = pendingRef.current;
    if (pending) {
      setOptions(pending.options);
      setView(pending.view);
      window.scrollTo({ top: 0 });
    }
    setCurtain('reveal');
  };

  const handleRevealed = () => {
    pendingRef.current = null;
    setCurtain('idle');
  };

  return (
    <>
      <UserCursor />
      <AnimatePresence>
        {loading && <Loader key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>
      {curtain !== 'idle' && (
        <CurtainTransition key={curtain} phase={curtain} onCovered={handleCovered} onRevealed={handleRevealed} />
      )}
      <AnimatePresence mode="wait">
      {view === 'home' && (
        <motion.div key="home" {...viewMotion}>
          <Home onOpenBlogs={openBlogs} />
        </motion.div>
      )}
      {view === 'blogs' && (
        <motion.div key="blogs" {...viewMotion}>
          <BlogsPage
            onBack={openHome}
            onOpenEditor={(postId) => openEditor(postId ? { editingId: postId } : {})}
            initialCategory={options.category}
            initialQuery={options.query}
            searchFocus={options.searchFocus}
          />
        </motion.div>
      )}
      {view === 'editor' && (
        <motion.div key="editor" {...viewMotion}>
          <BlogEditor
            onBack={() => openBlogs()}
            initialCategory={options.category}
            initialSearch={options.query}
            searchFocus={options.searchFocus}
            initialPostId={options.editingId}
          />
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default App;
