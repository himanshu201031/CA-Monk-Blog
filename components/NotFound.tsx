import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFound.css';
import { Magnetic } from '../animations/Magnetic';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** The animated face — eyes drop in, blink, pupils scan, mouth draws on. */
const Face: React.FC = () => (
  <svg
    className="nf-face"
    viewBox="0 0 320 380"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={25}
    aria-hidden
  >
    <g className="face__eyes" transform="translate(0,112.5)">
      <g transform="translate(15,0)">
        <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
        <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
      </g>
      <g transform="translate(230,0)">
        <polyline className="face__eye-lid" points="37,0 0,120 75,120" />
        <polyline className="face__pupil" points="55,120 55,155" strokeDasharray="35 35" />
      </g>
    </g>
    <rect className="face__nose" x="132.5" y="112.5" width={55} height={155} rx={4} ry={4} />
    <g transform="translate(65,334)" strokeDasharray="102 102">
      <path className="face__mouth-left" d="M 0 30 C 0 30 40 0 95 0" />
      <path className="face__mouth-right" d="M 95 0 C 150 0 190 30 190 30" />
    </g>
  </svg>
);

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f8f9fb] px-6 py-20 text-center">
    {/* Ambient orbs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#4c44d4]/10 blur-3xl animate-float-slow" />
      <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#8363f9]/10 blur-3xl animate-float-slower" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4c44d4]/5 blur-3xl" />
    </div>

    {/* Dot grid */}
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(76,68,212,0.12) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
      }}
    />

    <motion.main
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative flex flex-col items-center"
    >
      <div className="text-[#4c44d4]">
        <Face />
      </div>

      <p className="mt-8 text-[11px] font-black uppercase tracking-[0.45em] text-[#4c44d4]">Error 404</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
        This page{' '}
        <span className="text-[#4c44d4]">
          wandered off
        </span>{' '}
        the map.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
        The page you're looking for doesn't exist, was moved, or took an unscheduled vacation. Let's get you back on
        track.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Magnetic strength={0.25}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="group relative overflow-hidden rounded-full bg-[#4c44d4] px-6 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-[#4c44d4]/30 transition-colors hover:bg-[#3b35a8]"
          >
            <span className="relative z-10">Back to Home</span>
          </motion.button>
        </Magnetic>
        <Magnetic strength={0.25}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/blogs')}
            className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Explore the Blog
          </motion.button>
        </Magnetic>
      </div>

      <p className="mt-12 font-mono text-[11px] tracking-[0.3em] text-slate-400">HTTP 404 · NOT_FOUND</p>
    </motion.main>
  </div>
  );
};

export default NotFound;
