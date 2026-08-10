import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";

/**
 * UserCursor — a site-wide custom cursor that replaces the OS cursor on
 * fine-pointer (mouse) devices. An arrow glyph tracks the pointer with spring
 * physics; a colored label pill trails behind on a laggier spring, rocking
 * with motion, scaling while pressed, and swapping its text ("View" / "Type")
 * when hovering interactive elements.
 *
 * - Rendered as a fixed, full-viewport overlay with `pointer-events: none`,
 *   so clicks pass straight through to the page.
 * - Hides the native cursor by adding `uc-active` to <body> while mounted
 *   (CSS in styles/animations.css scopes it to fine pointers).
 * - Automatically returns null on coarse-pointer (touch) devices.
 *
 * Adapted from the Originkit UserCursor preset for full-screen use.
 */

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [contenteditable="true"]';

export interface UserCursorProps {
  /** Label shown in the trailing pill when NOT hovering an interactive element. */
  name?: string;
  /** Arrow + pill accent color. */
  color?: string;
  /** Label pill text color. */
  textColor?: string;
  /** Arrow glyph size in px. */
  size?: number;
  /** Max label-rock angle (degrees) derived from pointer velocity. */
  labelTiltStrength?: number;
  /** Show the trailing label pill at all. */
  showLabel?: boolean;
  /** Scale applied to arrow + pill while the mouse button is down. */
  pressScale?: number;
  /** Auto-derive label offsets from `size` instead of using explicit values. */
  labelOffsetUseDefault?: boolean;
  labelOffsetX?: number;
  labelOffsetY?: number;
  /** Extra offset of the arrow from the raw pointer position. */
  offsetX?: number;
  offsetY?: number;
  /** Overlay z-index (must sit above modals/toasts). */
  zIndex?: number;
  /** Swap the pill text over interactive elements. */
  interactiveLabel?: boolean;
  /** Pill text over links/buttons/cards. */
  viewText?: string;
  /** Pill text over text inputs/areas. */
  typeText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function UserCursor(props: UserCursorProps) {
  const {
    name = "",
    color = "#7159ED",
    textColor = "#FFFFFF",
    size = 31,
    labelTiltStrength = 25,
    showLabel = true,
    pressScale = 0.92,
    labelOffsetUseDefault = true,
    labelOffsetX = 25,
    labelOffsetY = 12,
    offsetX = 0,
    offsetY = 0,
    zIndex = 9999,
    interactiveLabel = true,
    viewText = "View",
    typeText = "Type",
    className,
    style,
  } = props;

  // --- touch detection (coarse pointers never get the custom cursor) ------
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouchDevice(!!mql.matches);
    sync();
    if (mql.addEventListener) {
      mql.addEventListener("change", sync);
      return () => mql.removeEventListener("change", sync);
    }
    const legacy = mql as MediaQueryList & {
      addListener?: (l: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (l: (e: MediaQueryListEvent) => void) => void;
    };
    legacy.addListener?.(sync);
    return () => legacy.removeListener?.(sync);
  }, []);

  // Hide the native cursor only while the custom cursor is actually active.
  useEffect(() => {
    if (isTouchDevice) return;
    document.body.classList.add("uc-active");
    return () => document.body.classList.remove("uc-active");
  }, [isTouchDevice]);

  // --- state ---------------------------------------------------------------
  const [pressed, setPressed] = useState(false);
  const [interactive, setInteractive] = useState<"view" | "type" | null>(null);
  const interactiveRef = useRef<"view" | "type" | null>(null);

  // Fixed spring configs — arrow is snappier, label trails behind.
  const arrowSpring = useMemo<SpringOptions>(
    () => ({ stiffness: 380, damping: 32, mass: 0.6 }),
    []
  );
  const labelSpringCfg = useMemo<SpringOptions>(
    () => ({ stiffness: 220, damping: 26, mass: 0.7 }),
    []
  );

  // --- motion values --------------------------------------------------------
  // Raw pointer position, initialized off-screen so springs don't swoop in
  // from (0,0) on the very first frame.
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const arrowX = useSpring(mouseX, arrowSpring);
  const arrowY = useSpring(mouseY, arrowSpring);
  const labelX = useSpring(mouseX, labelSpringCfg);
  const labelY = useSpring(mouseY, labelSpringCfg);

  // Press + hover scale (springy bounce).
  const scaleMV = useMotionValue(1);
  useEffect(() => {
    const target = pressScale * (interactive ? 1.14 : 1);
    const controls = animate(scaleMV, pressed ? target : 1, {
      type: "spring",
      stiffness: 500,
      damping: 28,
      mass: 0.5,
    });
    return () => controls.stop();
  }, [pressed, pressScale, interactive, scaleMV]);

  // Label tilt derived from pointer velocity (rocks as the cursor moves).
  const labelTiltTarget = useMotionValue(0);
  const labelRotation = useSpring(labelTiltTarget, {
    stiffness: 200,
    damping: 24,
    mass: 0.6,
  });

  // Label offsets derived from size.
  const labelTranslateX = useTransform(labelX, (v) =>
    v + (labelOffsetUseDefault ? size * 0.9 : labelOffsetX)
  );
  const labelTranslateY = useTransform(labelY, (v) =>
    v + (labelOffsetUseDefault ? size * 0.2 + 6 : labelOffsetY)
  );

  // --- pointer listeners (window-level = full screen) ----------------------
  const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (isTouchDevice) return;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX + offsetX;
      const y = e.clientY + offsetY;

      // First real reading: jump the springs to the pointer instead of
      // animating a long swoosh from off-screen.
      if (!initializedRef.current) {
        initializedRef.current = true;
        arrowX.set(x);
        arrowY.set(y);
        labelX.set(x);
        labelY.set(y);
      }
      mouseX.set(x);
      mouseY.set(y);

      // Velocity for direction-aware tilt & label rocking.
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      const last = lastSampleRef.current;
      let vx = 0;
      let vy = 0;
      if (last) {
        const dt = Math.max(1, now - last.t);
        vx = ((e.clientX - last.x) / dt) * 1000;
        vy = ((e.clientY - last.y) / dt) * 1000;
      }
      lastSampleRef.current = { x: e.clientX, y: e.clientY, t: now };

      const speed = Math.hypot(vx, vy);
      const norm = Math.min(1, speed / 1500);
      const sign = vx === 0 ? 0 : vx > 0 ? 1 : -1;
      labelTiltTarget.set(sign * norm * labelTiltStrength);

      // Interactive-element detection → label swap.
      if (interactiveLabel) {
        const el = e.target as HTMLElement | null;
        const hit =
          el && typeof el.closest === "function"
            ? el.closest(INTERACTIVE_SELECTOR)
            : null;
        let next: "view" | "type" | null = null;
        if (hit) {
          const tag = hit.tagName;
          const isText =
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            hit.getAttribute("contenteditable") === "true";
          next = isText ? "type" : "view";
        }
        if (next !== interactiveRef.current) {
          interactiveRef.current = next;
          setInteractive(next);
        }
      }
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      lastSampleRef.current = null;
      labelTiltTarget.set(0);
      interactiveRef.current = null;
      setInteractive(null);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      setPressed(false);
    };
  }, [
    isTouchDevice,
    interactiveLabel,
    labelTiltStrength,
    offsetX,
    offsetY,
    mouseX,
    mouseY,
    arrowX,
    arrowY,
    labelX,
    labelY,
    labelTiltTarget,
  ]);

  if (isTouchDevice) return null;

  const resolvedLabel = interactive
    ? interactive === "type"
      ? typeText
      : viewText
    : name;
  const hasLabel =
    typeof resolvedLabel === "string" && resolvedLabel.length > 0;

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        pointerEvents: "none",
        overflow: "hidden",
        ...style,
      }}
    >
      <CursorLayer
        arrowX={arrowX}
        arrowY={arrowY}
        labelX={labelTranslateX}
        labelY={labelTranslateY}
        labelRotation={labelRotation}
        scale={scaleMV}
        showLabel={showLabel && hasLabel}
        color={color}
        textColor={textColor}
        size={size}
        labelText={resolvedLabel as string}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CursorLayer — the moving arrow + label pill.
// ---------------------------------------------------------------------------

function CursorLayer(props: {
  arrowX: MotionValue<number>;
  arrowY: MotionValue<number>;
  labelX: MotionValue<number>;
  labelY: MotionValue<number>;
  labelRotation: MotionValue<number>;
  scale: MotionValue<number>;
  showLabel: boolean;
  color: string;
  textColor: string;
  size: number;
  labelText: string;
}) {
  const {
    arrowX,
    arrowY,
    labelX,
    labelY,
    labelRotation,
    scale,
    showLabel,
    color,
    textColor,
    size,
    labelText,
  } = props;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Label pill — rendered BEHIND the arrow so the arrow tip stays on top. */}
      {showLabel && (
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            x: labelX,
            y: labelY,
            rotate: labelRotation,
            scale,
            background: color,
            borderRadius: 999,
            padding: `${size * 0.18}px ${size * 0.36}px`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08)",
            transformOrigin: "0% 50%",
            willChange: "transform",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: textColor,
              fontSize: Math.max(7, size * 0.43),
              lineHeight: 1.1,
              fontWeight: 600,
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              whiteSpace: "nowrap",
              letterSpacing: 0.1,
              display: "block",
            }}
          >
            {labelText}
          </span>
        </motion.div>
      )}

      {/* Arrow — macOS-ish cursor pointing up-left, anchored at its tip. */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          x: arrowX,
          y: arrowY,
          scale,
          width: size,
          height: size,
          transformOrigin: "0% 0%",
          willChange: "transform",
          pointerEvents: "none",
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 28 28"
          fill="none"
          style={{ display: "block", overflow: "visible" }}
        >
          <path
            d="M5 3 L23 14 L14 16 L11 24 Z"
            fill={color}
            stroke="rgba(0,0,0,0.18)"
            strokeWidth={0.6}
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default UserCursor;
