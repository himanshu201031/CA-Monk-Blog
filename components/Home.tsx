import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ScrollToTop } from '../animations/ScrollToTop';
import { Parallax, ParallaxImg } from '../animations/Parallax';
import { Magnetic } from '../animations/Magnetic';
import { WordReveal } from '../animations/WordReveal';
import { Typewriter } from '../animations/Typewriter';
import { StaggerTestimonials } from './ui/stagger-testimonials';
import { RuixenGradientFooter } from './ui/ruixen-gradient-footer';
import {
  CardCurtainReveal,
  CardCurtainRevealBody,
  CardCurtainRevealTitle,
  CardCurtainRevealDescription,
  CardCurtainRevealFooter,
  CardCurtain,
} from './ui/card-curtain-reveal';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Animated footer glow — brand-tinted ramp (light violet → indigo → soft
   purple), so the scroll-reveal colour animation fits the light theme. */
const BLOGIFY_STOPS = [
  { offset: 0, color: '#eef2ff' },
  { offset: 0.22, color: '#c7d2fe' },
  { offset: 0.4, color: '#a5b4fc' },
  { offset: 0.58, color: '#818cf8' },
  { offset: 0.74, color: '#4c44d4' },
  { offset: 0.88, color: '#8363f9' },
  { offset: 1, color: '#c4b5fd00' },
];

const categories = [
  { label: 'Technology', icon: '💻' },
  { label: 'Lifestyle', icon: '🌿' },
  { label: 'Productivity', icon: '⚡' },
  { label: 'Design', icon: '🎨' },
  { label: 'Travel', icon: '✈️' },
  { label: 'Business', icon: '📈' },
];

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Blog', href: '#blog', blog: true },
  { label: 'Categories', href: '#categories' },
  { label: 'Trending', href: '#trending' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const featuredArticles = [
  {
    id: 1,
    category: 'Technology',
    title: '10 Web Development Trends to Watch in 2025',
    description: 'Stay ahead with the latest tools, frameworks, and techniques shaping the future of the web.',
    author: 'Alex Johnson',
    date: 'Jul 25, 2025',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    category: 'Productivity',
    title: '7 Morning Habits That Boost Your Productivity',
    author: 'Sarah Smith',
    date: 'Jul 24, 2025',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    category: 'Travel',
    title: 'Hidden Gems: Places You Must Visit Once',
    author: 'Michael Lee',
    date: 'Jul 23, 2025',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    category: 'Lifestyle',
    title: 'Minimalism: Living More with Less',
    author: 'Olivia Brown',
    date: 'Jul 22, 2025',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=800&q=80',
  },
];

const trendingNow = [
  {
    id: 1,
    title: 'How AI Is Changing the Way We Work',
    author: 'David Miller',
    date: 'Jul 21, 2025',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 2,
    title: 'The Ultimate Guide to Remote Work',
    author: 'Emma Wilson',
    date: 'Jul 20, 2025',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 3,
    title: "Beginner's Guide to Photography",
    author: 'Liam Taylor',
    date: 'Jul 19, 2025',
    image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 4,
    title: '10 Healthy Habits for a Better You',
    author: 'Sophia Clark',
    date: 'Jul 18, 2025',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80',
  },
];

const marqueeItems = [
  ...categories.map((c) => c.label),
  'Fresh Perspectives',
  'Expert Insights',
  'Weekly Digest',
  'Community Picks',
];

/* ---------------- helpers ---------------- */

const scrollToId = (href: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/** Scroll-triggered fade + rise reveal */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}> = ({ children, delay = 0, y = 26, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

/** Animated count-up number */
const CountUp: React.FC<{ to: number; suffix?: string; className?: string }> = ({ to, suffix = '', className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const heroWord: Variants = {
  hidden: { y: '0.7em', opacity: 0 },
  show: { y: '0em', opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

const heroWords = [
  { text: 'Stories', className: 'text-slate-950' },
  { text: 'that', className: 'text-slate-950' },
  { text: 'inspire', className: 'text-[#4c44d4]' },
  { text: 'minds.', className: 'text-slate-950' },
];

const storySegments = [
  'Blogify started with a simple frustration: publishing a beautiful blog post online should not take a design team.',
  'We wanted a place where writers, makers, and curious minds could focus on the words — not the plumbing.',
  'So we built a writing experience that feels like a calm, focused studio. No distractions, no clutter.',
  'Every story gets a clean reader view, smart search, and instant publishing to a page that loads in the blink of an eye.',
  'Categories and tags keep your ideas organized, while built-in analytics show what your readers actually love.',
  'Ideas deserve to travel, so every post can be scheduled, shared, and sent straight to your subscribers\' inbox.',
  'Thousands of writers now call Blogify home — publishing stories, building audiences, and shipping their best work.',
  'This is more than a blog. It\'s a home for ideas worth sharing.',
];

const features = [
  { icon: '⚡', title: 'Fast by design', text: 'Sub-second loads and a distraction-free editor, so the words always come first.' },
  { icon: '🎨', title: 'Beautiful editor', text: 'A focused writing studio with live preview, autosave, and one-click publishing.' },
  { icon: '📊', title: 'Built-in analytics', text: 'See what resonates — reads, word counts, and category trends at a glance.' },
  { icon: '🌍', title: 'Community driven', text: 'Categories, tags, and comments that bring writers and readers together.' },
];

/* ---------------- page ---------------- */

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 24);
    setShowTop(y > 520);
  });

  // Header progress bar (spring-smoothed)
  const progress = useSpring(scrollY, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const scaleX = useTransform(progress, [0, 1], [0, 1]);

  // Hero image parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  // Section depth — background orbs drift at different rates than the page.
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, 190]);
  const chipY1 = useTransform(scrollYProgress, [0, 1], [0, 64]);
  const chipY2 = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // Hero featured-visual mouse tilt (spring-smoothed 3D lean)
  const tiltX = useSpring(0, { stiffness: 160, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 160, damping: 18 });
  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  useEffect(() => {
    if (!subscribed) return;
    const timer = setTimeout(() => setSubscribed(false), 2800);
    return () => clearTimeout(timer);
  }, [subscribed]);

  const subscribe = () => setSubscribed(true);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f8f9fb] text-slate-900 antialiased">
        <ScrollToTop />

        {/* Subscribe toast */}
        <AnimatePresence>
          {subscribed && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="fixed bottom-6 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#4c44d4] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_20px_50px_rgba(76,68,212,0.35)]"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
              You're subscribed! Check your inbox soon.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ HEADER ============ */}
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
        >
          <div
            className={`relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl border transition-all duration-500 ${
              scrolled
                ? 'border-slate-200/80 bg-white/85 shadow-[0_14px_44px_rgba(15,23,42,0.1)] backdrop-blur-2xl'
                : 'border-transparent bg-white/50 backdrop-blur-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
              {/* Brand */}
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
                  <motion.div
                    whileHover={{ rotate: -10, scale: 1.08 }}
                    transition={{ duration: 0.25 }}
                    className="relative grid h-9 w-9 place-items-center rounded-xl bg-[#4c44d4] text-white shadow-lg shadow-[#4c44d4]/30 ring-1 ring-white/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                      <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                      <path d="m2.3 2.3 7.286 7.286" />
                      <circle cx="11" cy="11" r="2" />
                    </svg>
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-400" />
                  </motion.div>
                  <div className="leading-none">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 transition-colors group-hover:text-[#4c44d4]">
                      Blogify
                    </p>
                    <p className="mt-0.5 hidden text-[13px] font-black tracking-tight text-slate-950 sm:block">
                      Stories & insights
                    </p>
                  </div>
                </a>
              </Magnetic>

              {/* Desktop nav */}
              <nav className="hidden items-center gap-3 text-[13px] font-semibold text-slate-500 md:flex">
                {navLinks.map((link) => (
                  <Magnetic key={link.label} strength={0.18}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (link.blog) {
                          e.preventDefault();
                          navigate('/blogs');
                        } else {
                          scrollToId(link.href)(e);
                        }
                      }}
                      className="group relative overflow-hidden rounded-full px-3 py-2 transition-colors hover:bg-white/70 hover:text-slate-950"
                    >
                      <span className="relative block overflow-hidden">
                        <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
                          {link.label}
                        </span>
                        <span className="absolute inset-0 block translate-y-full text-[#4c44d4] transition-transform duration-300 ease-out group-hover:translate-y-0">
                          {link.label}
                        </span>
                      </span>
                      <span className="absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-[#4c44d4] transition-transform duration-300 group-hover:scale-x-100" />
                    </a>
                  </Magnetic>
                ))}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2">

                <motion.button
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  aria-label="Search"
                  onClick={() => navigate('/blogs?focus=1')}
                  className="hidden h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-500 transition-colors hover:border-[#4c44d4]/40 hover:bg-[#eef2ff] hover:text-[#4c44d4] sm:grid"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.button>
                <Magnetic strength={0.25}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={subscribe}
                    className="group relative overflow-hidden rounded-full bg-[#4c44d4] px-4 py-2 text-[13px] font-semibold text-white shadow-lg shadow-[#4c44d4]/30 transition-shadow hover:bg-[#3b35a8] hover:shadow-[#4c44d4]/45"
                  >
                    <span className="relative z-10">Subscribe</span>
                  </motion.button>
                </Magnetic>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Toggle menu"
                  aria-expanded={menuOpen}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/70 text-slate-700 transition-colors hover:border-[#4c44d4]/40 hover:bg-[#eef2ff] hover:text-[#4c44d4] md:hidden"
                >
                  <div className="flex w-4 flex-col items-end gap-[5px]">
                    <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} className="h-[1.5px] w-4 rounded-full bg-current" />
                    <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="h-[1.5px] w-3 rounded-full bg-current" />
                    <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} className="h-[1.5px] w-4 rounded-full bg-current" />
                  </div>
                </button>
              </div>
            </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.34, ease: EASE }}
                className="overflow-hidden md:hidden"
              >
                <div className="flex flex-col gap-1 border-t border-slate-100 px-3 pb-3 pt-2 sm:px-4">
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        if (link.blog) {
                          navigate('/blogs');
                        } else {
                          scrollToId(link.href)(e);
                        }
                        setMenuOpen(false);
                      }}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.32, ease: EASE }}
                      className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4c44d4] opacity-0 transition-opacity group-hover:opacity-100" />
                        {link.label}
                      </span>
                      <svg className="h-3.5 w-3.5 -translate-x-1 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </motion.a>
                  ))}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.32, ease: EASE }}
                    onClick={subscribe}
                    className="group relative mt-1 overflow-hidden rounded-xl bg-[#4c44d4] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4c44d4]/25 transition-colors hover:bg-[#3b35a8]"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
          </div>

          {/* Reading progress */}
          <motion.div
            style={{ scaleX }}
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#4c44d4]"
          />
        </motion.header>

        {/* ============ HERO ============ */}
        <main id="home" className="relative mx-auto max-w-[1200px] scroll-mt-24 px-4 sm:px-6">            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
              <motion.div style={{ y: blobY1 }}>
                <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#4c44d4]/10 blur-3xl animate-float-slow" />
              </motion.div>
              <motion.div style={{ y: blobY2 }}>
                <div className="absolute -right-20 top-40 h-64 w-64 rounded-full bg-[#8363f9]/10 blur-3xl animate-float-slower" />
              </motion.div>
              <div className="absolute -right-16 top-8 h-64 w-64 rounded-full bg-[#8363f9]/20 blur-3xl" />
              <div className="absolute -left-16 top-72 h-56 w-56 rounded-full bg-[#4c44d4]/15 blur-3xl" />
            </div>

          {/* Hero grid */}
          <section className="relative grid items-stretch gap-5 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Copy */}
            <motion.div
              variants={heroContainer}
              initial="hidden"
              animate="show"
              className="relative flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10"
            >

              <motion.span
                variants={heroItem}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#4c44d4]/15 bg-[#eef2ff] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#4c44d4]"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4c44d4] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4c44d4]" />
                </span>
                Welcome to Blogify
              </motion.span>

              <h2 className="mt-5 text-[34px] font-black leading-[1.08] tracking-tight sm:text-4xl lg:text-[44px]">
                <span className="inline-flex flex-wrap gap-x-[0.28em]">
                  {heroWords.map((word, i) => (
                    <span key={i} className="inline-flex overflow-hidden pb-1">
                      <motion.span variants={heroWord} className={`inline-block ${word.className}`}>
                        {word.text}
                      </motion.span>
                    </span>
                  ))}
                </span>
              </h2>

              <motion.p variants={heroItem} className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-[15px]">
                Write without friction. Read without noise. Stories on technology, lifestyle, productivity and more —
                curated for curious minds.
              </motion.p>

              <motion.div variants={heroItem} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/blogs')}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#4c44d4] px-5 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[#4c44d4]/25 transition-colors hover:bg-[#3b35a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c44d4]"
                >
                  Explore Articles
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/blogs')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c44d4]"
                >
                  Browse Categories
                </motion.button>
              </motion.div>

              <motion.div
                variants={heroItem}
                className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center">
                  <div className="flex -space-x-2.5">
                    {['https://i.pravatar.cc/40?img=11', 'https://i.pravatar.cc/40?img=12', 'https://i.pravatar.cc/40?img=13', 'https://i.pravatar.cc/40?img=14'].map((src, i) => (
                      <motion.img
                        key={i}
                        src={src}
                        alt="reader avatar"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: EASE }}
                        className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                      />
                    ))}
                  </div>
                  <span className="ml-3 text-xs font-medium text-slate-500">
                    <CountUp to={10000} suffix="+" className="font-black text-slate-900" /> readers growing daily
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">✦ 6 topics</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    <CountUp to={12000} suffix="+" className="font-black text-slate-900" /> monthly readers
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Featured visual — a live article drafting in Blogify's own reading
                view. The product, not a stock photo: this is the signature. */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              onMouseMove={onTilt}
              onMouseLeave={resetTilt}
              style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
              className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:min-h-[400px]"
            >
              {/* Decorative depth layer (drifts on scroll) */}
              <motion.div style={{ y: imgY }} className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle,rgba(76,68,212,0.10)_1px,transparent_1px)] [background-size:22px_22px]" />
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#4c44d4]/[0.07] blur-3xl" />
                <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#8363f9]/10 blur-3xl" />
              </motion.div>

              {/* Wordmark bar */}
              <div className="relative flex items-center justify-between border-b border-slate-100 px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#4c44d4] text-[10px] text-white">✦</span>
                  <span className="text-[12px] font-black tracking-tight text-slate-950">Blogify</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Issue 048</span>
              </div>

              {/* Article body */}
              <div className="relative flex flex-1 flex-col justify-center px-5 py-6 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#4c44d4]">
                    Writing
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">4 min read</span>
                </div>
                <h3 className="mt-3 text-[22px] font-black leading-[1.15] tracking-tight text-slate-950 sm:text-[26px]">
                  Write first. <span className="text-[#4c44d4]">Polish later.</span>
                </h3>
                <div className="mt-3 flex items-center gap-2.5">
                  <img
                    src="https://i.pravatar.cc/40?img=47"
                    alt="Maya Chen"
                    className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                  />
                  <span className="text-[11px] font-semibold text-slate-500">
                    Maya Chen <span className="text-slate-300">·</span>{' '}
                    <span className="text-slate-400">Writer</span>
                  </span>
                </div>
                <Typewriter
                  text="Ideas don't need a perfect first draft — they need a door: a blank page you're willing to open."
                  delay={1400}
                  className="mt-4 max-w-sm text-[13px] leading-6 text-slate-600"
                />
              </div>

              {/* Reading progress — the story is 62% drafted */}
              <div className="relative h-[3px] w-full bg-slate-100">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '62%' }}
                  transition={{ delay: 1.6, duration: 2.2, ease: EASE }}
                  className="h-full bg-[#4c44d4]"
                />
              </div>

              {/* Floating chips */}
              <motion.div style={{ y: chipY1 }} className="absolute left-4 top-4">
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: EASE }}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/85 px-3 py-1.5 text-[11px] font-bold text-slate-800 backdrop-blur-md"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4c44d4] opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4c44d4]" />
                  </span>
                  Drafting live
                </motion.div>
              </motion.div>
              <motion.div style={{ y: chipY2 }} className="absolute bottom-4 right-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5, ease: EASE }}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/85 px-3 py-1.5 text-[11px] font-bold text-slate-800 backdrop-blur-md"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Saved automatically
                </motion.div>
              </motion.div>
            </motion.div>
          </section>

          {/* Scroll hint */}
          <motion.div
            animate={{ opacity: scrolled ? 0 : 1, y: scrolled ? -12 : 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none relative mx-auto mt-7 flex w-fit flex-col items-center gap-1.5"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-slate-400">Scroll to explore</span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[#4c44d4]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.span>
          </motion.div>

          {/* ============ MARQUEE ============ */}
          <Reveal y={16} className="group marquee mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-2.5 shadow-sm [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span key={i} className="flex items-center gap-10 text-[13px] font-bold text-slate-500">
                  {item}
                  <span className="text-[#4c44d4]">✦</span>
                </span>
              ))}
            </div>
          </Reveal>

          {/* ============ CATEGORIES ============ */}
          <Parallax speed={14}>
          <section id="categories" className="scroll-mt-24 pt-12 sm:pt-16">
            <Reveal>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#4c44d4]">Browse by topic</p>
                  <span className="hidden text-xs font-medium text-slate-400 sm:block">6 categories</span>
                </div>
                <motion.div
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.4 }}
                  className="flex flex-wrap gap-2"
                >
                  {categories.map((category) => (
                    <motion.button
                      key={category.label}
                      variants={{
                        hidden: { opacity: 0, y: 12, scale: 0.94 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
                      }}
                      whileHover={{ y: -2, scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/blogs?category=' + encodeURIComponent(category.label))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#4c44d4]/40 hover:bg-[#eef2ff] hover:text-[#4c44d4]"
                    >
                      <span className="text-sm leading-none">{category.icon}</span>
                      {category.label}
                    </motion.button>
                  ))}
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, y: 12, scale: 0.94 },
                      show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
                    }}
                    whileHover={{ y: -2 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-[#4c44d4]/50 hover:text-[#4c44d4]"
                  >
                    <span className="text-base leading-none">⋯</span>
                    More
                  </motion.button>
                </motion.div>
              </div>
            </Reveal>
          </section>
          </Parallax>

          {/* ============ FEATURED ============ */}
          <Parallax speed={18}>
          <section className="pt-12 sm:pt-16">
            <Reveal>
              <SectionHeading
                eyebrow="Editor's Picks"
                title="Featured this week"
                link="View all →"
                href="#trending"
              />
            </Reveal>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Lead story */}
              <Reveal>
                <motion.article
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  onClick={() => navigate('/blogs?q=' + encodeURIComponent(featuredArticles[0].title))}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                >
                  <ParallaxImg
                    src={featuredArticles[0].image}
                    alt={featuredArticles[0].title}
                    className="h-48 sm:h-56"
                  />
                  <div className="p-5 sm:p-7">
                    <span className="inline-flex rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4c44d4]">
                      {featuredArticles[0].category}
                    </span>
                    <h3 className="mt-3 text-xl font-black leading-snug text-slate-950 sm:text-2xl">
                      {featuredArticles[0].title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-slate-600">{featuredArticles[0].description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">By {featuredArticles[0].author}</span>
                      <span className="text-slate-300">•</span>
                      <span>{featuredArticles[0].date}</span>
                      <span className="text-slate-300">•</span>
                      <span>{featuredArticles[0].readTime}</span>
                    </div>
                  </div>
                </motion.article>
              </Reveal>

              {/* Stacked stories */}
              <div className="grid content-start gap-5">
                {featuredArticles.slice(1).map((article, i) => (
                  <Reveal key={article.id} delay={0.08 * i} y={20}>
                    <motion.article
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      onClick={() => navigate('/blogs?q=' + encodeURIComponent(article.title))}
                      className="group flex cursor-pointer gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm transition-shadow hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
                    >
                      <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col justify-center">
                        <span className="inline-flex w-fit rounded-full bg-[#f7f0ff] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#7b56fd]">
                          {article.category}
                        </span>
                        <h4 className="mt-1.5 line-clamp-2 text-sm font-black leading-snug text-slate-950 sm:text-[15px]">
                          {article.title}
                        </h4>
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          By {article.author} • {article.readTime}
                        </p>
                      </div>
                    </motion.article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
          </Parallax>

          {/* ============ TRENDING ============ */}
          <Parallax speed={24}>
          <section id="trending" className="scroll-mt-24 pt-12 sm:pt-16">
            <Reveal>
              <SectionHeading eyebrow="Trending Now" title="What our readers are exploring" link="View all trending →" href="#trending" />
            </Reveal>

            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {trendingNow.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
                  }}
                >
                  <CardCurtainReveal
                    className="h-64 cursor-pointer rounded-2xl border border-slate-200/70 bg-white text-slate-900 shadow-sm transition-shadow hover:shadow-[0_20px_44px_rgba(15,23,42,0.12)]"
                    onClick={() => navigate('/blogs?q=' + encodeURIComponent(item.title))}
                  >
                    <CardCurtainRevealBody className="p-4">
                      <div className="flex items-start justify-between">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-[11px] font-black text-slate-700">
                          {String(item.id).padStart(2, '0')}
                        </span>
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-700">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                      <CardCurtainRevealTitle className="mt-4 text-base font-black leading-snug tracking-tight">
                        {item.title}
                      </CardCurtainRevealTitle>
                      <CardCurtainRevealDescription className="mt-2">
                        <p className="text-[11px] font-medium text-slate-500">
                          By {item.author} • {item.date}
                        </p>
                      </CardCurtainRevealDescription>
                      <CardCurtain className="bg-zinc-50" />
                    </CardCurtainRevealBody>
                    <CardCurtainRevealFooter className="mt-auto">
                      <ParallaxImg src={item.image} alt={item.title} className="h-40" amount={6} />
                    </CardCurtainRevealFooter>
                  </CardCurtainReveal>
                </motion.div>
              ))}
            </motion.div>
          </section>
          </Parallax>

          {/* ============ STORY ============ */}
          <section id="story" className="scroll-mt-24 pt-12 sm:pt-16">
            <Reveal>
              <SectionHeading eyebrow="Our story" title="More than a blog — a home for ideas" />
            </Reveal>

            <Reveal y={20}>
              <div className="flex justify-center">
                <WordReveal segments={storySegments} scrollLength={185} className="mt-6 w-full max-w-3xl text-center" />
              </div>
            </Reveal>

            <motion.div
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#4c44d4]/10 text-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                    {f.icon}
                  </div>
                  <h3 className="mt-3.5 text-sm font-black text-slate-950">{f.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-500">{f.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ============ TESTIMONIALS ============ */}
          <section id="testimonials" className="scroll-mt-24 pt-12 sm:pt-16">
            <Reveal>
              <SectionHeading
                eyebrow="Testimonials"
                title="Loved by readers & writers"
                link=""
              />
            </Reveal>
            <Reveal y={20}>
              <div className="mt-8 overflow-hidden rounded-3xl">
                <StaggerTestimonials />
              </div>
            </Reveal>
          </section>

          {/* ============ NEWSLETTER ============ */}
          <Parallax speed={16}>
          <section id="about" className="scroll-mt-24 pt-12 sm:pt-16">
            <Reveal y={32}>
              <div className="relative overflow-hidden rounded-3xl border border-[#4c44d4]/15 bg-white px-6 py-8 shadow-[0_24px_60px_rgba(76,68,212,0.08)] sm:px-10 sm:py-10">
                  <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#4c44d4]/10 blur-3xl animate-float-slow" />
                  <div className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-[#8363f9]/10 blur-3xl animate-float-slower" />

                  <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#4c44d4]">
                        Don't miss a story.
                      </p>
                      <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                        Get the best articles delivered to your inbox every week.
                      </h2>
                      <p className="mt-3 max-w-lg text-[13px] leading-6 text-slate-600">
                        Join a curated newsletter that helps you stay inspired, productive, and ahead of your next big
                        idea.
                      </p>
                    </div>
                    <form
                      className="grid gap-2.5 sm:grid-cols-[1fr_auto]"
                      onSubmit={(e) => {
                        e.preventDefault();
                        subscribe();
                      }}
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter your email address"
                        className="min-w-0 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#4c44d4] focus:ring-2 focus:ring-[#4c44d4]/25"
                      />
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        className="rounded-full bg-[#4c44d4] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4c44d4]/25 transition-colors hover:bg-[#3b35a8]"
                      >
                        Subscribe
                      </motion.button>
                    </form>
                  </div>
              </div>
            </Reveal>
          </section>
          </Parallax>
        </main>

        {/* ============ FOOTER ============ */}
        <RuixenGradientFooter
          gradientHeight="50vh"
          minReveal={0.04}
          stops={BLOGIFY_STOPS}
          className="mt-14 scroll-mt-24 border-t border-slate-200/70 sm:mt-20"
        >
          <div className="relative z-10 bg-white">
          <div id="contact" className="mx-auto grid max-w-[1200px] scroll-mt-24 gap-8 px-4 py-10 sm:px-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#4c44d4] text-white">
                  <span className="text-sm font-black">B</span>
                </div>
                <span className="text-base font-black text-slate-950">Blogify</span>
              </div>
              <p className="max-w-xs text-[13px] leading-6 text-slate-500">
                A platform for curious minds. Explore ideas, stories and perspectives that matter.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[
                  'M12 2.2c3.2 0 5.7 2.5 5.7 5.7 0 1.6-.6 3-1.6 4.1.1 3.6-2.1 6.8-5.4 7.9l-.7.2-.7-.2c-3.3-1.1-5.5-4.3-5.4-7.9-1-1.1-1.6-2.5-1.6-4.1 0-3.2 2.5-5.7 5.7-5.7zm0 2.5c-1.7 0-3.1 1.4-3.1 3.1 0 1.6-1.6 2.2-1.6 2.2s.5 4 4.7 5.4c4.2-1.4 4.7-5.4 4.7-5.4s-1.6-.6-1.6-2.2c0-1.7-1.4-3.1-3.1-3.1z',
                  'M20.45 20.98l-6.87-9.87 6.54-6.87h-1.96l-5.37 5.64-4.3-5.64H3.93l6.53 9.39-6.8 7.14h1.96l5.6-5.88 4.49 5.88h2.74zM6.22 5.04h3.15l10.39 14h-3.15L6.22 5.04z',
                  'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zm0 2.16a4 4 0 110 8 4 4 0 010-8zm6.4-3.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z',
                ].map((d, i) => (
                  <motion.a
                    key={i}
                    href="#contact"
                    whileHover={{ y: -3, color: '#4c44d4' }}
                    aria-label="Social link"
                    className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={d} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            <FooterCol
              title="Quick Links"
              items={['Home', 'Categories', 'Trending', 'About Us', 'Contact']}
            />
            <FooterCol
              title="Categories"
              items={categories.map((c) => c.label)}
            />
            <FooterCol
              title="Legal"
              items={['Privacy Policy', 'Terms of Service', 'Cookie Policy', '404 Page']}
              onClickItem={(item) => {
                if (item === '404 Page') navigate('/404');
              }}
            />
          </div>

          <div className="border-t border-slate-100">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-slate-400 sm:flex-row sm:px-6">
              <span>© 2025 Blogify. All rights reserved.</span>
              <span className="flex items-center gap-1.5">
                Made with <span className="text-[#4c44d4]">♥</span> for curious minds
              </span>
            </div>
          </div>
          </div>
        </RuixenGradientFooter>

        {/* Back to top */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="fixed bottom-6 right-6 z-[150] grid h-11 w-11 place-items-center rounded-full bg-[#4c44d4] text-white shadow-xl shadow-[#4c44d4]/30 transition-colors hover:bg-[#3b35a8]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};

/* ---------------- sub-components ---------------- */

const SectionHeading: React.FC<{
  eyebrow: string;
  title: string;
  link?: string;
  href?: string;
}> = ({ eyebrow, title, link, href = '#' }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.35em] text-[#4c44d4]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4c44d4]" />
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">{title}</h2>
    </div>
    {link && (
      <a
        href={href}
        onClick={scrollToId(href)}
        className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:text-[#4c44d4]"
      >
        {link}
        <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    )}
  </div>
);

const FooterCol: React.FC<{ title: string; items: string[]; onClickItem?: (item: string) => void }> = ({
  title,
  items,
  onClickItem,
}) => (
  <div>
    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</h3>
    <ul className="mt-4 space-y-2.5 text-[13px] text-slate-600">
      {items.map((item) => (
        <li key={item}>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              onClickItem?.(item);
            }}
            className="inline-flex items-center gap-1.5 transition-all hover:translate-x-0.5 hover:text-[#4c44d4]"
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Home;
