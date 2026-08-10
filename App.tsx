import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './components/Home';
import BlogsPage from './components/BlogsPage';
import BlogEditor from './components/BlogEditor';
import UserCursor from './components/ui/user-cursor';
import Loader from './components/Loader';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface BlogNavOptions {
  category?: string;
  query?: string;
  searchFocus?: boolean;
  editingId?: number;
}

type View = 'home' | 'blogs' | 'editor';

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

  const openBlogs = (opts: BlogNavOptions = {}) => {
    setOptions(opts);
    setView('blogs');
    window.scrollTo({ top: 0 });
  };

  const openEditor = (opts: BlogNavOptions = {}) => {
    setOptions(opts);
    setView('editor');
    window.scrollTo({ top: 0 });
  };

  const openHome = () => {
    setView('home');
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <UserCursor />
      <AnimatePresence>
        {loading && <Loader key="loader" onDone={() => setLoading(false)} />}
      </AnimatePresence>
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
