import VelocityGallery from "@/components/VelocityGallery";
import SiteHeader from "@/components/SiteHeader";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Gallery() {
  return (
    <div className="min-h-screen bg-[#060e08] text-white">
      {/* Dark theme header */}
      <div className="relative z-30">
        <SiteHeader darkMode />
      </div>

      <main className="relative">
        <VelocityGallery />
      </main>

      <footer className="border-t border-white/[0.06] bg-[#060e08] py-8">
        <div className="container flex flex-col justify-between gap-3 text-[11px] text-white/25 sm:flex-row sm:items-center">
          <span className="font-mono uppercase tracking-[0.18em]">
            Phanindranath Nursery School &amp; Kindergarten House
          </span>
          <div className="flex gap-5">
            <a
              href="https://www.facebook.com/share/19R4Q7PDtv/"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-white/40 transition hover:text-[#c9a55a]"
            >
              Facebook
            </a>
            <Link
              href="/admin"
              className="font-bold text-white/40 transition hover:text-[#c9a55a]"
            >
              Staff portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

