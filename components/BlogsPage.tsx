import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_IMAGE,
  formatDate,
  getCategories,
  loadPosts,
  loadSettings,
  readTime,
  type StoredPost,
} from '../lib/blogStore';
import { Parallax, ParallaxImg } from '../animations/Parallax';
import { Magnetic } from '../animations/Magnetic';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const navLinks: { label: string; href: string; home?: boolean }[] = [
  { label: 'Home', href: '#top', home: true },
  { label: 'Categories', href: '#filters' },
  { label: 'Trending', href: '#posts' },
];

export const BlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const posts = useMemo(() => loadPosts(), []);
  const published = useMemo(
    () =>
      posts
        .filter((p) => p.status === 'published')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [posts]
  );
  const settings = useMemo(() => loadSettings(), []);
  const categories = useMemo(() => getCategories(), []);

  const focusSearch = searchParams.get('focus') === '1';
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'All');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keep the URL in sync with the live search/filter state.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (category !== 'All') next.set('category', category);
    setSearchParams(next, { replace: true });
  }, [query, category, setSearchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (focusSearch) searchRef.current?.focus();
  }, [focusSearch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return published.filter((p) => {
      const inCategory = category === 'All' || p.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [published, query, category]);

  const scrollToId = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="top" className="min-h-screen bg-[#f8f9fb] text-slate-900 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className={`mx-auto flex max-w-[1200px] items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-500 sm:px-4 ${
            scrolled
              ? 'border-slate-200/80 bg-white/85 shadow-[0_14px_44px_rgba(15,23,42,0.1)] backdrop-blur-2xl'
              : 'border-transparent bg-white/50 backdrop-blur-md'
          }`}
        >
          <Magnetic strength={0.25}>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex shrink-0 items-center gap-2.5"
            >
              <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#4c44d4] text-white shadow-lg shadow-[#4c44d4]/30 ring-1 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                  <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                  <path d="m2.3 2.3 7.286 7.286" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-400" />
              </div>
              <div className="leading-none">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 transition-colors group-hover:text-[#4c44d4]">
                  {settings.siteName}
                </p>
                <p className="mt-0.5 hidden text-[13px] font-black tracking-tight text-slate-950 sm:block">
                  {settings.tagline}
                </p>
              </div>
            </a>
          </Magnetic>

          <nav className="hidden items-center gap-3 text-[13px] font-semibold text-slate-500 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.home) {
                    e.preventDefault();
                    navigate('/');
                  } else {
                    scrollToId(link.href)(e);
                  }
                }}
                className="group relative overflow-hidden rounded-full px-3 py-2 transition-colors hover:bg-white/70 hover:text-slate-950"
              >
                <span className="relative block overflow-hidden">
                  <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">{link.label}</span>
                  <span className="absolute inset-0 block translate-y-full text-[#4c44d4] transition-transform duration-300 ease-out group-hover:translate-y-0">
                    {link.label}
                  </span>
                </span>
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-[#4c44d4] transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="hidden rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-[13px] font-semibold text-slate-600 backdrop-blur-sm transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900 sm:block"
            >
              ← Home
            </button>
            <Magnetic strength={0.25}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/blogs/new')}
                className="group relative overflow-hidden rounded-full bg-[#4c44d4] px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-[#4c44d4]/30 transition-colors hover:bg-[#3b35a8]"
              >
                <span className="relative z-10">＋ Create Post</span>
              </motion.button>
            </Magnetic>
          </div>
        </div>
      </header>

      {/* Hero */}
      <Parallax speed={10}>
      <section className="relative mx-auto max-w-[1200px] px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <Parallax speed={55}>
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#4c44d4]/10 blur-3xl animate-float-slow" />
          </Parallax>
          <Parallax speed={90}>
            <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-[#8363f9]/10 blur-3xl animate-float-slower" />
          </Parallax>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4c44d4]/15 bg-[#eef2ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#4c44d4]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4c44d4] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4c44d4]" />
              </span>
              {published.length} live stories
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[44px]">
              All our <span className="text-[#4c44d4]">stories</span>, in one place.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600 sm:text-[15px]">
              Explore everything we've published — search, filter by topic, or jump straight into writing your own.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                {published.length} <span className="text-slate-400">stories</span>
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                {categories.length} <span className="text-slate-400">topics</span>
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                {published.reduce((n, p) => n + p.content.trim().split(/\s+/).length, 0).toLocaleString()}{' '}
                <span className="text-slate-400">words</span>
              </span>
            </div>
          </div>

          {/* Latest story spotlight */}
          {published[0] && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
              onClick={() => navigate('/blogs/' + published[0].id + '/edit')}
              className="group relative hidden h-56 w-full cursor-pointer overflow-hidden rounded-3xl bg-white text-left shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:block lg:h-64"
            >
              <ParallaxImg
                src={published[0].featuredImage ?? DEFAULT_IMAGE}
                alt=""
                className="h-full w-full"
                amount={6}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="inline-flex rounded-full bg-slate-900/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-700 backdrop-blur-sm">
                  Latest
                </span>
                <p className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[#4c44d4]">{published[0].category}</p>
                <h3 className="mt-1 line-clamp-1 text-lg font-black leading-tight text-slate-950 sm:text-xl">
                  {published[0].title}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatDate(published[0].date)}</span>
                  <span className="text-slate-300">•</span>
                  <span>{readTime(published[0].content)}</span>
                </div>
              </div>
            </motion.button>
          )}
        </motion.div>

        {/* Search + filters */}
        <motion.div
          id="filters"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
          className="mt-8 scroll-mt-24"
        >
          <div className="relative max-w-xl">
            <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              aria-label="Search blogs"
              placeholder="Search stories, tags, topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#4c44d4] focus:ring-4 focus:ring-[#4c44d4]/10"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['All', ...DEFAULT_CATEGORIES].map((c) => (
              <motion.button
                key={c}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  category === c
                    ? 'border-[#4c44d4] bg-[#4c44d4] text-white shadow-lg shadow-[#4c44d4]/25'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#4c44d4]/40 hover:text-[#4c44d4]'
                }`}
              >
                {c}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>
      </Parallax>

      {/* Posts */}
      <Parallax speed={20}>
      <main id="posts" className="mx-auto max-w-[1200px] scroll-mt-24 px-4 pb-4 sm:px-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            {category === 'All' ? 'Latest stories' : category}
            <span className="ml-2 text-sm font-semibold text-slate-400">{filtered.length}</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/70 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-3xl">📭</p>
            <p className="mt-3 text-sm font-semibold text-slate-600">
              {query.trim() ? 'No stories match your search.' : 'Nothing here yet.'}
            </p>
            <p className="mt-1 text-[13px] text-slate-400">
              Try a different search — or be the first to write about it.
            </p>
            <button
              onClick={() => navigate('/blogs/new')}
              className="mt-6 rounded-full bg-[#4c44d4] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#3b35a8]"
            >
              ＋ Create Post
            </button>
          </div>
        ) : (
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((p) => (
              <motion.article
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, ease: EASE }}
                onClick={() => navigate('/blogs/' + p.id + '/edit')}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-[0_20px_44px_rgba(15,23,42,0.12)]"
              >
                <div className="relative h-40 overflow-hidden sm:h-44">
                  <ParallaxImg
                    src={p.featuredImage || undefined}
                    alt={p.title}
                    className="h-40 sm:h-44"
                    amount={10}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {p.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#4c44d4] shadow-sm backdrop-blur-sm">
                      {p.category}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-950 group-hover:text-[#4c44d4]">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-slate-600">{p.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>{formatDate(p.date)}</span>
                    <span>{readTime(p.content)} min read</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </main>
      </Parallax>

      {/* Gradient footer */}
      <footer className="mt-12 border-t border-slate-200/70 bg-white">
        <div className="mx-auto w-full max-w-[1200px] px-4 pt-12 sm:px-6">
          <div className="grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#4c44d4] text-white">
                  <span className="text-sm font-black">B</span>
                </div>
                <span className="text-base font-black text-slate-950">{settings.siteName}</span>
              </div>
              <p className="mt-4 max-w-xs text-[13px] leading-6 text-slate-500">
                {settings.tagline}. Explore ideas, stories and perspectives that matter.
              </p>
              <div className="mt-6 flex max-w-xs gap-2">
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="you@example.com"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#4c44d4] focus:ring-2 focus:ring-[#4c44d4]/15"
                />
                <button
                  type="button"
                  className="h-9 shrink-0 rounded-xl bg-[#4c44d4] px-4 text-xs font-bold text-white transition-colors hover:bg-[#3b35a8]"
                >
                  Join
                </button>
              </div>
            </div>

            <nav className="grid grid-cols-2 gap-8 text-[13px] font-semibold text-slate-600 sm:grid-cols-4 lg:col-span-4">
              {[
                { title: 'Product', links: ['Overview', 'Features', 'Integrations', 'Pricing', 'Changelog'] },
                { title: 'Resources', links: ['Docs', 'Guides', 'API reference', 'Support', 'Status'] },
                { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press', 'Contact'] },
                { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
              ].map((col) => (
                <div key={col.title}>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{col.title}</h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-[#4c44d4]">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pb-2 pt-6 text-[11px] font-semibold text-slate-400 sm:flex-row">
            <span>© 2026 {settings.siteName}. All rights reserved.</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems normal
            </span>
            <button onClick={() => navigate('/')} className="transition-colors hover:text-[#4c44d4]">← Back to Home</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogsPage;
