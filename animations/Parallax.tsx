import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Parallax — wraps a section and drifts it vertically as it crosses the
 * viewport. Content scrolls at a slightly different rate than the page,
 * giving each section a sense of depth.
 */
interface ParallaxProps {
  children: React.ReactNode;
  /** Total vertical travel in px while the element crosses the viewport. */
  speed?: number;
  /** Set true to move opposite to the default direction. */
  reverse?: boolean;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 40,
  reverse = false,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reverse ? [speed, -speed] : [-speed, speed]
  );

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

/**
 * ParallaxImg — an image that shifts inside its (fixed-height, overflow
 * hidden) frame as the page scrolls. The image is oversized and centered so
 * the frame is always fully covered, even while translating + zooming on
 * hover.
 */
interface ParallaxImgProps {
  src?: string;
  alt: string;
  /** Classes for the frame — must give it an explicit height. */
  className?: string;
  /** Parallax travel as a % of the frame height (default 8). */
  amount?: number;
  /** Subtle zoom on hover (composes with the scroll parallax). */
  hoverZoom?: boolean;
  /** Called when the image fails to load (lets callers hide broken covers). */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const ParallaxImg: React.FC<ParallaxImgProps> = ({
  src,
  alt,
  className,
  amount = 8,
  hoverZoom = true,
  onError,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.img
        src={src}
        alt={alt}
        onError={onError}
        style={{
          y,
          position: "absolute",
          top: `-${amount}%`,
          left: 0,
          width: "100%",
          height: `${100 + amount * 2}%`,
        }}
        whileHover={hoverZoom ? { scale: 1.06 } : undefined}
        className="object-cover"
      />
    </div>
  );
};

export default Parallax;
