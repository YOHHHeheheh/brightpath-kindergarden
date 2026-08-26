import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ImageIcon, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "wouter";

type GalleryGridProps = { compact?: boolean };

// ── Parallax card ─────────────────────────────────────────────────────────
// Tracks its own scroll progress and applies layered 3D depth on scroll +
// a gentle tilt on mouse hover.
function ParallaxCard({
  entry,
  index,
  compact,
  onSelect,
}: {
  entry: { id: number; imageUrl: string; altText: string; category: string; title: string };
  index: number;
  compact: boolean;
  onSelect: (id: number) => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);

  // Per-card scroll progress (start end → end start = full viewport crossing)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Smooth spring wrapping the raw scroll value
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  // Image parallax: moves at a different rate than the card → depth illusion
  const imageY = useTransform(smoothProgress, [0, 1], ["10%", "-10%"]);

  // Card entry: fades + rises into position as it scrolls into view
  const cardOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const cardY = useTransform(scrollYProgress, [0, 0.14], [60, 0]);

  // 3D tilt on mouse move
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(x * 12);
    rotateX.set(-y * 8);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const isWide = compact && index === 0;

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={() => onSelect(entry.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: cardOpacity,
        y: cardY,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 800,
      }}
      whileTap={{ scale: 0.97 }}
      className={`group relative overflow-hidden rounded-[1.75rem] bg-[#e9ece5] text-left shadow-[0_12px_30px_rgba(44,65,51,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136] focus-visible:ring-offset-4 will-change-transform ${isWide ? "md:col-span-2" : ""}`}
    >
      {/* Parallax image: taller than container so movement stays within bounds */}
      <div className={`overflow-hidden ${compact ? "h-72" : "h-80"}`}>
        <motion.img
          src={entry.imageUrl}
          alt={entry.altText}
          loading="lazy"
          style={{ y: imageY }}
          className="h-[115%] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* Text overlay */}
      <span className="absolute inset-x-0 bottom-0 flex flex-col bg-gradient-to-t from-[#14261b]/85 via-[#14261b]/20 to-transparent px-5 pb-5 pt-14 text-white">
        <motion.span
          className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#f8ddb0]"
          initial={{ opacity: 0.85, y: 4 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {entry.category}
        </motion.span>
        <motion.span
          className="mt-1 block font-serif text-xl leading-tight"
          initial={{ opacity: 0.9, y: 4 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
        >
          {entry.title}
        </motion.span>
      </span>

      {/* Subtle shine on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      />
    </motion.button>
  );
}

// ── GalleryGrid ────────────────────────────────────────────────────────────
export default function GalleryGrid({ compact = false }: GalleryGridProps) {
  const { data, isLoading } = trpc.gallery.listPublic.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const entries = data ?? [];
  const visibleEntries = compact ? entries.slice(0, 3) : entries;
  const selected = entries.find((e) => e.id === selectedId);

  if (isLoading) {
    return (
      <div
        className={`grid gap-4 ${compact ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}
        aria-label="Loading gallery"
      >
        {Array.from({ length: compact ? 3 : 6 }).map((_, i) => (
          <div key={i} className={`animate-pulse rounded-[1.75rem] bg-[#e7e8df] ${compact ? "h-72" : "h-80"}`} />
        ))}
      </div>
    );
  }

  if (visibleEntries.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-[#cdd5cc] bg-[#f7f8f2] px-6 py-12 text-center sm:px-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e3eee3] text-[#467158]">
          <ImageIcon className="h-5 w-5" />
        </span>
        <h3 className="mt-5 font-serif text-2xl text-[#2d4736]">More moments are on their way.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#687568]">
          Our staff-curated gallery is being refreshed. Visit again soon to see the small discoveries that brighten the day.
        </p>
        {!compact && (
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#315743] hover:text-[#b68136]">
            Return to Phanindranath <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Staggered cards grid */}
      <motion.div
        className={`grid gap-4 ${compact ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {visibleEntries.map((entry, index) => (
          <ParallaxCard
            key={entry.id}
            entry={entry}
            index={index}
            compact={compact}
            onSelect={setSelectedId}
          />
        ))}
      </motion.div>

      {compact && entries.length > 3 && (
        <motion.div
          className="mt-7 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-[#b7c4b7] px-5 py-2.5 text-sm font-bold text-[#315743] transition-colors hover:border-[#315743] hover:bg-[#f1f5ee]"
          >
            See the full gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* Lightbox dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        {selected && (
          <DialogContent className="max-w-4xl overflow-hidden border-0 bg-[#1d3025] p-0 text-white sm:rounded-[1.6rem]">
            <DialogTitle className="sr-only">{selected.title}</DialogTitle>
            <DialogDescription className="sr-only">{selected.altText}</DialogDescription>
            <motion.img
              src={selected.imageUrl}
              alt={selected.altText}
              className="max-h-[72vh] w-full object-contain"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <div className="flex items-end justify-between gap-5 p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e5c98e]">{selected.category}</p>
                <p className="mt-1 font-serif text-2xl">{selected.title}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white"
                onClick={() => setSelectedId(null)}
                aria-label="Close gallery image"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
