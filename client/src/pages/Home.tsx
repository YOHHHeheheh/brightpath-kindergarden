import GalleryGrid from "@/components/GalleryGrid";
import SiteHeader from "@/components/SiteHeader";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  ExternalLink,
  Flower2,
  Leaf,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";
import { Link } from "wouter";

// ── Editorial moments: real school photos ──────────────────────────────────
const editorialMoments = [
  {
    image: "/school-photos/image_22.jpg",
    label: "A School United",
    description:
      "Parents, students, and teachers gathered together — one community, one heart, celebrating every milestone.",
  },
  {
    image: "/school-photos/image_28.jpg",
    label: "Joyful Courtyard",
    description:
      "Festive rhythms, shared smiles, and the contagious energy of children celebrating their school days.",
  },
  {
    image: "/school-photos/image_16.jpg",
    label: "Young Patriots",
    description:
      "Students honouring the nation with pride — learning history by living it, in costume and spirit.",
  },
];

// ── Scroll-parallax hook for hero ──────────────────────────────────────────
function useHeroParallax() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
  });
  // Hero image moves up slightly slower than scroll → depth illusion
  const imageY = useTransform(smoothProgress, [0, 1], ["0%", "18%"]);
  // Decorative blobs drift in opposite direction
  const blobY = useTransform(smoothProgress, [0, 1], ["0%", "-28%"]);
  // Text content fades and rises as user scrolls past
  const textOpacity = useTransform(smoothProgress, [0, 0.55], [1, 0]);
  const textY = useTransform(smoothProgress, [0, 0.55], [0, -36]);

  return { heroRef, imageY, blobY, textOpacity, textY };
}

// ── Spring-physics button ──────────────────────────────────────────────────
function SpringButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const scale = useMotionValue(1);
  const springScale = useSpring(scale, { stiffness: 420, damping: 18 });

  return (
    <motion.a
      href={href}
      style={{ scale: springScale }}
      onHoverStart={() => scale.set(1.07)}
      onHoverEnd={() => scale.set(1)}
      onTapStart={() => scale.set(0.94)}
      onTap={() => scale.set(1)}
      className={className}
    >
      {children}
    </motion.a>
  );
}

// ── Staggered scroll-reveal section ───────────────────────────────────────
const revealContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.13 },
  },
};
const revealItem = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function Home() {
  const { heroRef, imageY, blobY, textOpacity, textY } = useHeroParallax();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfbf7] text-[#2b4434]">
      <SiteHeader />
      <main>
        {/* ── HERO ── */}
        <section ref={heroRef} className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-20 bg-[#f0f3ec]" />

          {/* Parallax decorative blobs */}
          <motion.div
            style={{ y: blobY }}
            className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full bg-[#dbe9db] blur-3xl"
          />
          <motion.div
            style={{ y: blobY }}
            className="pointer-events-none absolute -left-32 bottom-10 -z-10 h-64 w-64 rounded-full bg-[#e8c97e]/20 blur-3xl"
          />

          <div className="container grid min-h-[620px] items-center gap-10 pb-14 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-20">
            {/* Text column – fades + rises on scroll */}
            <motion.div
              style={{ opacity: textOpacity, y: textY }}
              className="max-w-2xl"
            >
              {/* Rating pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-6 inline-flex cursor-default items-center gap-3 rounded-full border border-white/60 bg-white/50 py-1.5 pl-1.5 pr-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-lg"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3bc67]">
                  <Star className="h-5 w-5 fill-white text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#284432]">4.8/5</span>
                  <div className="flex text-[#e3bc67]">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <span className="text-sm font-medium text-[#5d765f]">
                    (120+ Parent Reviews)
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.22 }}
                className="mt-2 font-serif text-[3.5rem] leading-[0.94] tracking-[-0.055em] text-[#284432] sm:text-7xl lg:text-[5.4rem]"
              >
                A beautiful beginning{" "}
                <em className="font-serif font-normal text-[#b68136]">
                  to growing up.
                </em>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="mt-4 text-xs font-extrabold uppercase tracking-[0.15em] text-[#5d765f]"
              >
                Phanindranath Nursery School &amp; Phanindranath Kindergarten
                House
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44 }}
                className="mt-5 max-w-xl text-base leading-8 text-[#5d6d61] sm:text-lg"
              >
                A warm, thoughtful kindergarten where children are known,
                supported, and encouraged to follow their curiosity—one small
                discovery at a time.
              </motion.p>

              {/* CTA buttons with spring physics */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.54 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <SpringButton
                  href="#rhythm"
                  className="rounded-full bg-[#315743] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(49,87,67,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136] focus-visible:ring-offset-2 inline-block"
                >
                  Discover our rhythm
                </SpringButton>
                <motion.a
                  href="https://www.facebook.com/share/19R4Q7PDtv/"
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c6d2c5] px-6 py-3.5 text-sm font-bold text-[#315743] hover:border-[#315743] hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136]"
                >
                  Follow us on Facebook <ExternalLink className="h-4 w-4" />
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold text-[#496151]"
              >
                <span className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#b68136]" /> Gentle,
                  responsive care
                </span>
                <span className="flex items-center gap-2">
                  <Flower2 className="h-4 w-4 text-[#b68136]" /> Wonder-led
                  learning
                </span>
              </motion.div>
            </motion.div>

            {/* Hero image column — parallax on scroll */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="relative mx-auto w-full max-w-[560px] lg:mr-0"
            >
              <div className="absolute -left-7 top-10 hidden h-24 w-24 rounded-full border-[14px] border-[#e9c97d]/65 sm:block" />
              <div className="relative overflow-hidden rounded-[2.6rem] bg-[#dae6d7] p-3 shadow-[0_30px_80px_rgba(42,68,50,0.18)] sm:p-4">
                <motion.img
                  src="/school-photos/image_07.jpg"
                  alt="Phanindranath students smiling and proudly showcasing their handmade art and craft creations in the classroom"
                  style={{ y: imageY }}
                  className="h-[430px] w-full rounded-[2rem] object-cover sm:h-[520px]"
                />
                <div className="absolute bottom-7 left-7 rounded-2xl bg-[#fcfbf7]/95 px-5 py-4 shadow-lg backdrop-blur">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#9a733b]">
                    A brighter start
                  </p>
                  <p className="mt-1 font-serif text-xl text-[#315743]">
                    Little hands, big wonder.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-3 rounded-[1.4rem] bg-[#315743] px-5 py-4 text-white shadow-xl sm:-right-8">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#d8bc7d]">
                  Open weekdays
                </p>
                <p className="mt-1 font-serif text-xl">6:45 AM–4 PM</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── HOURS BAND ── */}
        <section
          id="rhythm"
          className="scroll-mt-20 bg-[#315743] py-12 text-white sm:py-16"
        >
          <div className="container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#e8ca8b]">
                <Clock3 className="h-4 w-4" /> Our opening hours
              </p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
                A steady rhythm for busy families.
              </h2>
            </div>
            <div className="rounded-[1.6rem] border border-white/15 bg-white/[0.07] px-7 py-6 sm:min-w-[380px]">
              <div className="flex items-center gap-4">
                <CalendarDays className="h-8 w-8 shrink-0 text-[#f0cf8c]" />
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#bdd1bf]">
                    Mon–Fri
                  </p>
                  <p className="mt-1 font-serif text-3xl">6:45 AM–4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── APPROACH / VALUES ── */}
        <section id="approach" className="container scroll-mt-20 py-20 sm:py-28">
          <motion.div
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid items-end gap-10 lg:grid-cols-[0.85fr_1.15fr]"
          >
            <motion.div variants={revealItem}>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a87533]">
                The Phanindranath way
              </p>
              <h2 className="mt-4 font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-[#2c4736]">
                Made for the way childhood really feels.
              </h2>
            </motion.div>
            <motion.p
              variants={revealItem}
              className="max-w-2xl text-base leading-8 text-[#637064] sm:text-lg"
            >
              Our highly rated care experience is rooted in respect for each
              child's pace. There is room to play, to rest, to build confidence,
              and to feel completely at home.
            </motion.p>
          </motion.div>

          <motion.div
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-12 grid gap-5 md:grid-cols-3"
          >
            <motion.div variants={revealItem}>
              <ValueCard
                icon={<Leaf className="h-5 w-5" />}
                title="A considered environment"
                text="Inviting spaces and simple rituals help children settle in, explore freely, and feel secure."
              />
            </motion.div>
            <motion.div variants={revealItem}>
              <ValueCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Learning through wonder"
                text="Questions, stories, art, movement, and outdoor moments turn everyday curiosity into discovery."
              />
            </motion.div>
            <motion.div variants={revealItem}>
              <ValueCard
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Care that feels personal"
                text="Warm, attentive relationships help every child feel seen—at drop-off, at play, and throughout the day."
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ── LIFE IN COLOUR (editorial moments) ── */}
        <section className="bg-[#f1f3ed] py-20 sm:py-28">
          <div className="container">
            <motion.div
              variants={revealContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
            >
              <motion.div variants={revealItem} className="max-w-xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a87533]">
                  Life in colour
                </p>
                <h2 className="mt-4 font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-[#2c4736]">
                  The little moments leave the biggest impression.
                </h2>
              </motion.div>
              <motion.div variants={revealItem}>
                <Link
                  href="/gallery"
                  className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#315743] hover:text-[#b68136]"
                >
                  Visit the gallery <span aria-hidden="true">→</span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={revealContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="mt-12 grid gap-5 md:grid-cols-3"
            >
              {editorialMoments.map((moment, index) => (
                <motion.article
                  key={moment.label}
                  variants={revealItem}
                  whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className={`overflow-hidden rounded-[1.75rem] bg-white shadow-[0_14px_35px_rgba(53,70,56,0.08)] cursor-default ${
                    index === 1 ? "md:translate-y-8" : ""
                  }`}
                >
                  <div className="overflow-hidden">
                    <motion.img
                      src={moment.image}
                      alt={moment.label}
                      loading="lazy"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                      className="h-72 w-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-serif text-2xl text-[#315743]">
                      {moment.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#6b766c]">
                      {moment.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── COMMUNITY GALLERY ── */}
        <section className="container py-20 sm:py-28">
          <motion.div
            variants={revealContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.p
              variants={revealItem}
              className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#a87533]"
            >
              Our community gallery
            </motion.p>
            <motion.h2
              variants={revealItem}
              className="mt-4 font-serif text-5xl leading-[0.98] tracking-[-0.045em] text-[#2c4736]"
            >
              A few happy moments, shared by our team.
            </motion.h2>
            <motion.p
              variants={revealItem}
              className="mt-5 text-base leading-7 text-[#667267]"
            >
              Fresh photos are selected and published by Phanindranath staff.
            </motion.p>
          </motion.div>
          <div className="mt-12">
            <GalleryGrid compact />
          </div>
        </section>

        {/* ── STAFF CTA ── */}
        <section className="container pb-20 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="overflow-hidden rounded-[2.2rem] bg-[#dce9dc] px-7 py-10 sm:px-12 sm:py-14"
          >
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#52735a]">
                  For our staff
                </p>
                <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.035em] text-[#294333]">
                  Keep the school gallery current.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#5a6c5d]">
                  Approved staff can sign in securely to add, edit, publish, or
                  hold gallery moments for the public website.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                <Link
                  href="/admin"
                  className="inline-flex w-fit items-center justify-center rounded-full bg-[#315743] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(49,87,67,0.18)] transition-colors hover:bg-[#233f30]"
                >
                  Open staff portal
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#e7e8df] bg-[#f4f4ee] py-9">
        <div className="container flex flex-col justify-between gap-4 text-sm text-[#677368] sm:flex-row sm:items-center">
          <div>
            <span className="font-serif text-xl text-[#315743]">
              Phanindranath
            </span>
            <span className="ml-2 text-xs uppercase tracking-[0.14em]">
              Nursery School &amp; Kindergarten House
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="#rhythm" className="hover:text-[#b68136]">
              Hours
            </a>
            <Link href="/gallery" className="hover:text-[#b68136]">
              Gallery
            </Link>
            <a
              href="https://www.facebook.com/share/19R4Q7PDtv/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[#315743] hover:text-[#b68136]"
            >
              Facebook
            </a>
            <Link
              href="/admin"
              className="font-bold text-[#315743] hover:text-[#b68136]"
            >
              Staff portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="h-full rounded-[1.7rem] border border-[#e4e6de] bg-[#fdfdfb] p-7 shadow-[0_12px_30px_rgba(48,68,53,0.05)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2efdf] text-[#315743]">
        {icon}
      </span>
      <h3 className="mt-6 font-serif text-2xl text-[#315743]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#667267]">{text}</p>
    </article>
  );
}
