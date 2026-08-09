import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * useLenis — Initializes Lenis smooth scrolling for the whole document.
 * Returns a cleanup that destroys the instance on unmount.
 * The instance is exposed on `window.__lenis` for programmatic scrolling.
 */
export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // RAF loop required by Lenis
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Expose for programmatic scrolling (e.g. scroll-to-top)
    (window as any).__lenis = lenis;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);
}

export default useLenis;
