import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SQRT_5000 = Math.sqrt(5000);

/** How often the carousel advances on its own, in ms. */
const AUTO_ADVANCE_MS = 3500;

const testimonials = [
  {
    tempId: 0,
    testimonial:
      "I've published every morning for six months straight. The editor just gets out of my way.",
    by: "Priya, Writer at First Light",
    imgSrc: "https://i.pravatar.cc/150?img=1",
  },
  {
    tempId: 1,
    testimonial:
      "The reading experience is the best I've found anywhere — clean, fast, zero noise.",
    by: "Marcus, Daily Reader",
    imgSrc: "https://i.pravatar.cc/150?img=2",
  },
  {
    tempId: 2,
    testimonial:
      "My most-shared story came from a draft I almost deleted. So glad I kept going.",
    by: "Elena, Essayist",
    imgSrc: "https://i.pravatar.cc/150?img=3",
  },
  {
    tempId: 3,
    testimonial:
      "The analytics told me exactly what my readers wanted. My drafts doubled in a month.",
    by: "Sam, Newsletter Author",
    imgSrc: "https://i.pravatar.cc/150?img=4",
  },
  {
    tempId: 4,
    testimonial: "I switched from a notes app and never looked back. My whole archive lives here now.",
    by: "Yuki, Tech Blogger",
    imgSrc: "https://i.pravatar.cc/150?img=5",
  },
  {
    tempId: 5,
    testimonial:
      "The comments here are genuinely thoughtful. That never happens on the internet.",
    by: "Diego, Features Writer",
    imgSrc: "https://i.pravatar.cc/150?img=6",
  },
  {
    tempId: 6,
    testimonial:
      "I wrote my first post on a Sunday night. By Friday it had passed forty thousand reads.",
    by: "Aisha, First-Time Author",
    imgSrc: "https://i.pravatar.cc/150?img=7",
  },
  {
    tempId: 7,
    testimonial:
      "Drafts, scheduling, categories — it does everything my old CMS did, minus the pain.",
    by: "Tom, Content Lead",
    imgSrc: "https://i.pravatar.cc/150?img=8",
  },
  {
    tempId: 8,
    testimonial: "Reading here feels like opening a beautifully typeset book. I stay for hours.",
    by: "Nora, Literature Blogger",
    imgSrc: "https://i.pravatar.cc/150?img=9",
  },
  {
    tempId: 9,
    testimonial: "The search is instant — I found an article from three years ago in seconds.",
    by: "Kenji, Researcher",
    imgSrc: "https://i.pravatar.cc/150?img=10",
  },
  {
    tempId: 10,
    testimonial:
      "My readers keep asking who designed my site. I can't take the credit — the theme did.",
    by: "Lucia, Travel Writer",
    imgSrc: "https://i.pravatar.cc/150?img=11",
  },
  {
    tempId: 11,
    testimonial: "I write on my phone on the bus. It just works. That is surprisingly rare.",
    by: "Omar, Short-Form Writer",
    imgSrc: "https://i.pravatar.cc/150?img=12",
  },
  {
    tempId: 12,
    testimonial:
      "Autosave has rescued more of my essays than I can count. Quietly heroic feature.",
    by: "Ingrid, Freelance Journalist",
    imgSrc: "https://i.pravatar.cc/150?img=13",
  },
  {
    tempId: 13,
    testimonial: "Drafting here feels like thinking out loud — no friction, no ceremony.",
    by: "Felix, Product Essays",
    imgSrc: "https://i.pravatar.cc/150?img=14",
  },
  {
    tempId: 14,
    testimonial:
      "I finally finished the long-form essay I'd been avoiding for over a year.",
    by: "Sofia, Long-Form Writer",
    imgSrc: "https://i.pravatar.cc/150?img=15",
  },
  {
    tempId: 15,
    testimonial:
      "The typography makes my words look better than they deserve. I'll happily take it.",
    by: "James, Opinion Columnist",
    imgSrc: "https://i.pravatar.cc/150?img=16",
  },
  {
    tempId: 16,
    testimonial: "I moved my whole archive over in a single afternoon. Zero regrets since.",
    by: "Hana, Personal Blog",
    imgSrc: "https://i.pravatar.cc/150?img=17",
  },
  {
    tempId: 17,
    testimonial:
      "Reader comments here are kinder and sharper than anywhere else I've posted.",
    by: "Ravi, Science Writer",
    imgSrc: "https://i.pravatar.cc/150?img=18",
  },
  {
    tempId: 18,
    testimonial:
      "My site loads instantly and looks flawless on every single device.",
    by: "Chloe, Design Blog",
    imgSrc: "https://i.pravatar.cc/150?img=19",
  },
  {
    tempId: 19,
    testimonial:
      "I've tried every platform there is. This is the only one I've stuck with for two years.",
    by: "Andre, Food & Culture",
    imgSrc: "https://i.pravatar.cc/150?img=20",
  },
];

interface TestimonialCardProps {
  position: number;
  testimonial: (typeof testimonials)[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10 bg-primary text-primary-foreground border-primary"
          : "z-0 bg-card text-card-foreground border-border hover:border-primary/50",
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? "0px 8px 0px 4px var(--color-border)"
          : "0px 0px 0px 0px transparent",
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(",")[0]}`}
        className="mb-4 h-14 w-12 bg-muted object-cover object-top"
        style={{
          boxShadow: "3px 3px 0px var(--color-background)",
        }}
      />
      <h3
        className={cn(
          "text-base sm:text-xl font-medium",
          isCenter ? "text-primary-foreground" : "text-foreground",
        )}
      >
        "{testimonial.testimonial}"
      </h3>
      <p
        className={cn(
          "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
          isCenter ? "text-primary-foreground/80" : "text-muted-foreground",
        )}
      >
        - {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);
  // Autoplay: paused while the pointer is over the carousel (or the user is
  // interacting with the keyboard). `tick` resets the countdown on manual nav.
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  // Ref to the latest handler so the interval always advances the current list.
  const handleMoveRef = useRef<(steps: number) => void>(() => {});

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
    // Any manual rotation restarts the autoplay countdown.
    setTick((t) => t + 1);
  };
  handleMoveRef.current = handleMove;

  // Auto-rotate every few seconds; pause on hover / focus / reduced motion.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => handleMoveRef.current(1), AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, tick]);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-muted/30"
      style={{ height: 600 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default StaggerTestimonials;
