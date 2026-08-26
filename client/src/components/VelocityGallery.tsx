import { trpc } from "@/lib/trpc";
import {
  motion,
  MotionValue,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import React, { useRef, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────
type Entry = {
  id: number;
  imageUrl: string;
  altText: string;
  title: string;
  category: string;
};

// ── Single High-Performance 3D Plane ────────────────────────────────────────
function DiagonalPlane({
  entry,
  index,
  total,
  scrollProgress,
  velPitch,
  velYaw,
  velRoll,
  velZ,
  velSkew,
  onSelect,
}: {
  entry: Entry;
  index: number;
  total: number;
  scrollProgress: MotionValue<number>;
  velPitch: MotionValue<number>;
  velYaw: MotionValue<number>;
  velRoll: MotionValue<number>;
  velZ: MotionValue<number>;
  velSkew: MotionValue<number>;
  onSelect: (e: Entry) => void;
}) {
  // Distribute cards along the scroll progress line with overlap
  const step = 1 / Math.max(total - 1, 1);
  const centerP = index * step;

  // Active visibility window
  const windowRadius = 0.38;
  const pStart = centerP - windowRadius;
  const pEnd = centerP + windowRadius;

  // 1. HARDWARE-ACCELERATED NUMERIC DIAGONAL TRAJECTORY
  // Bottom-right (+650px X, +520px Y) -> Center (0, 0) -> Top-left (-650px X, -520px Y)
  const x = useTransform(scrollProgress, [pStart, centerP, pEnd], [680, 0, -680]);
  const y = useTransform(scrollProgress, [pStart, centerP, pEnd], [540, 0, -540]);

  // 2. DEPTH & SCALE
  const baseZ = useTransform(scrollProgress, [pStart, centerP, pEnd], [-420, 20, -420]);
  const scale = useTransform(scrollProgress, [pStart, centerP, pEnd], [0.75, 1.04, 0.75]);
  const opacity = useTransform(
    scrollProgress,
    [pStart, pStart + 0.08, centerP, pEnd - 0.08, pEnd],
    [0, 1, 1, 1, 0]
  );

  // 3. BASE RESTING TILTS
  const baseRotY = -22 + (index % 5) * 11; // staggered angles
  const baseRotX = 6 - (index % 3) * 5;
  const baseRotZ = -5;

  // 4. COMBINED NUMERIC ROTATIONS (GPU Composited)
  const rotateX = useTransform(velPitch, (v: number) => baseRotX + v);
  const rotateY = useTransform(velYaw, (v: number) => baseRotY + v);
  const rotateZ = useTransform(velRoll, (v: number) => baseRotZ + v);
  const z = useTransform([baseZ, velZ], (vals: number[]) => (vals[0] ?? 0) + (vals[1] ?? 0));

  // 5. LOCAL HOVER MICRO-TILT
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    mouseY.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
  }
  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }

  const indexStr = String(index).padStart(2, "0");

  return (
    <motion.div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        x,
        y,
        z,
        scale,
        opacity,
        rotateX,
        rotateY,
        rotateZ,
        skewX: velSkew,
        translateX: "-50%",
        translateY: "-50%",
        transformStyle: "preserve-3d",
        zIndex: 50 - index,
      }}
      className="will-change-transform select-none"
    >
      {/* Floating Monospace Number in 3D Space */}
      <div
        className="pointer-events-none absolute -top-6 left-1 z-30 font-mono text-xs font-bold tracking-widest text-white/90 drop-shadow"
        style={{ transform: "translateZ(25px)" }}
      >
        <span>{indexStr}</span>
      </div>

      <motion.button
        type="button"
        onClick={() => onSelect(entry)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileTap={{ scale: 0.96 }}
        style={{
          rotateX: isHovered ? mouseY : 0,
          rotateY: isHovered ? mouseX : 0,
          transition: "rotate 0.15s ease-out",
        }}
        className="group relative block w-[28vw] min-w-[240px] max-w-[400px] cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-neutral-950 shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-colors duration-200 hover:border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3bc67]"
      >
        {/* Photo Plane */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
          <img
            src={entry.imageUrl}
            alt={entry.altText}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-106"
          />

          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-60 transition-opacity group-hover:opacity-25" />

          {/* Caption */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-left opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="font-mono text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#e3bc67]">
              {entry.category}
            </p>
            <p className="mt-0.5 font-serif text-lg font-bold leading-tight text-white drop-shadow">
              {entry.title}
            </p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

// ── Lightbox Modal ──────────────────────────────────────────────────────────
function Lightbox({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#0a120d] shadow-[0_50px_120px_rgba(0,0,0,0.95)]"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={entry.imageUrl}
          alt={entry.altText}
          className="max-h-[72vh] w-full object-contain"
        />
        <div className="flex items-end justify-between gap-4 px-6 py-5">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#e3bc67]">
              {entry.category}
            </p>
            <p className="mt-1 font-serif text-2xl font-bold text-white">
              {entry.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/25 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/15"
          >
            Close ✕
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main High-Performance Velocity 3D Diagonal Gallery ──────────────────────
export default function VelocityGallery() {
  const { data, isLoading } = trpc.gallery.listPublic.useQuery();
  const [selected, setSelected] = useState<Entry | null>(null);

  // 1. Tall scroll container to give comfortable, smooth pacing
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 2. Smooth, lightweight scroll spring (no jitter)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 24,
    mass: 0.2,
  });

  // 3. Single centralized velocity calculation with gentle dampening
  const rawVelocity = useVelocity(scrollY);
  const normalizedVelocity = useTransform(rawVelocity, [-2500, 2500], [-1, 1]);
  const smoothVelocity = useSpring(normalizedVelocity, {
    stiffness: 70,
    damping: 22,
    mass: 0.2,
  });

  // 4. Centralized velocity transformations (shared across all planes)
  const velPitch = useTransform(smoothVelocity, [-1, 0, 1], [-22, 0, 22]);
  const velYaw = useTransform(smoothVelocity, [-1, 0, 1], [-30, 0, 30]);
  const velRoll = useTransform(smoothVelocity, [-1, 0, 1], [-14, 0, 14]);
  const velZ = useTransform(smoothVelocity, (v: number) => -Math.abs(v) * 160);
  const velSkew = useTransform(smoothVelocity, [-1, 0, 1], [-8, 0, 8]);

  const entries = data ?? [];

  return (
    <>
      {/* ── Scroll Section (550vh provides smooth, relaxing scroll speed) ── */}
      <div ref={containerRef} className="relative bg-[#050906] text-white">
        {/* ── Fixed Perspective Stage ── */}
        <div
          className="sticky top-0 h-screen w-full overflow-hidden"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
            contain: "layout paint",
          }}
        >
          {/* Ambient diagonal glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1)_0%,rgba(5,9,6,0.95)_75%)]" />

          {/* Top-Right Hatched Pattern */}
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-10 w-72 opacity-75"
            style={{
              background:
                "repeating-linear-gradient(45deg, rgba(20,184,166,0.45) 0, rgba(20,184,166,0.45) 2px, transparent 2px, transparent 8px), repeating-linear-gradient(45deg, rgba(245,158,11,0.25) 0, rgba(245,158,11,0.25) 1px, transparent 1px, transparent 6px)",
            }}
          />

          {/* Top-Left Headline */}
          <div className="pointer-events-none absolute left-8 top-10 z-20 select-none">
            <h1 className="font-sans text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              PHANINDRANATH<br />
              COLLECTION<sup className="ml-2 font-mono text-xs font-normal tracking-widest text-white/70">({entries.length})</sup>
            </h1>
            <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-teal-400/80">
              3D Diagonal Scroll • Velocity Physics
            </p>
          </div>

          {/* Bottom-Right "SCROLL TO SURF" Indicator */}
          <div className="pointer-events-none absolute bottom-8 right-8 z-20 flex items-center gap-2.5 select-none font-mono text-xs font-bold uppercase tracking-[0.28em] text-white/80">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            SCROLL TO SURF
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}

          {/* 3D Diagonal Planes Stage */}
          {!isLoading && entries.length > 0 && (
            <div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {entries.map((entry, index) => (
                <DiagonalPlane
                  key={entry.id}
                  entry={entry}
                  index={index}
                  total={entries.length}
                  scrollProgress={smoothProgress}
                  velPitch={velPitch}
                  velYaw={velYaw}
                  velRoll={velRoll}
                  velZ={velZ}
                  velSkew={velSkew}
                  onSelect={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scroll Track Length: smooth pacing without fast jarring */}
        <div className="h-[550vh]" aria-hidden="true" />
      </div>

      {/* Lightbox Modal */}
      {selected && <Lightbox entry={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
