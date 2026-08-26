import { Button } from "@/components/ui/button";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const links = [
  { label: "Our approach", href: "/#approach" },
  { label: "Our rhythm", href: "/#rhythm" },
  { label: "Gallery", href: "/gallery" },
];

export default function SiteHeader({ darkMode = false }: { darkMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const textBase = darkMode ? "text-white/70 hover:text-white" : "text-[#35463a] hover:text-[#b68136]";
  const activeColor = darkMode ? "text-[#e3bc67]" : "text-[#b68136]";

  const navLink = (link: (typeof links)[number], mobile = false) => (
    <a
      href={link.href}
      onClick={() => setOpen(false)}
      className={`text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136] focus-visible:ring-offset-4 ${mobile ? "block py-3 text-lg" : ""} ${location === "/gallery" && link.href === "/gallery" ? activeColor : textBase}`}
    >
      {link.label}
    </a>
  );

  return (
    <header
      className={`sticky top-0 z-50 ${
        darkMode
          ? "border-b border-white/[0.06] bg-black/40 backdrop-blur-xl"
          : "border-b border-[#e9e7df]/80 bg-[#fcfbf7]/90 backdrop-blur-xl"
      }`}
    >
      <div className="container flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136] focus-visible:ring-offset-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#315743] text-[#f8e5be] transition-transform duration-200 group-hover:-rotate-6">
            <Leaf className="h-5 w-5" />
          </span>
          <span>
            <span className={`block font-serif text-[19px] leading-none tracking-[-0.03em] ${darkMode ? "text-white" : "text-[#233b2d]"}`}>
              Phanindranath
            </span>
            <span className={`mt-1 block text-[8px] font-extrabold uppercase tracking-[0.13em] ${darkMode ? "text-white/35" : "text-[#6f7c71]"}`}>
              Nursery School &amp; Kindergarten House
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Public navigation">
          {links.map((link) => <span key={link.href}>{navLink(link)}</span>)}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="https://www.facebook.com/share/19R4Q7PDtv/"
            target="_blank"
            rel="noreferrer"
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136] ${darkMode ? "border-white/15 text-white/60 hover:bg-white/10 hover:text-white" : "border-[#d6d8d0] text-[#35463a] hover:border-[#315743] hover:bg-[#f1f5ee]"}`}
          >
            Facebook
          </a>
          <Link
            href="/admin"
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b68136] ${darkMode ? "border-white/15 text-white/60 hover:bg-white/10 hover:text-white" : "border-[#d6d8d0] text-[#35463a] hover:border-[#315743] hover:bg-[#f1f5ee]"}`}
          >
            Staff portal
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
          className={`rounded-full lg:hidden ${darkMode ? "text-white hover:bg-white/10" : "text-[#315743]"}`}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div className={`border-t px-5 pb-6 pt-3 shadow-xl lg:hidden ${darkMode ? "border-white/10 bg-black/70 backdrop-blur-xl" : "border-[#e9e7df] bg-[#fcfbf7]"}`}>
          <nav className="mx-auto max-w-md" aria-label="Mobile public navigation">
            {links.map((link) => <div key={link.href}>{navLink(link, true)}</div>)}
            <div className="mt-3 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              <a href="https://www.facebook.com/share/19R4Q7PDtv/" target="_blank" rel="noreferrer"
                className={`rounded-full px-4 py-2.5 text-sm font-bold ${darkMode ? "bg-white/10 text-white" : "bg-[#e9eff0] text-[#315743]"}`}>
                Facebook
              </a>
              <Link href="/admin" onClick={() => setOpen(false)}
                className={`rounded-full border px-4 py-2.5 text-sm font-bold ${darkMode ? "border-white/15 text-white/70" : "border-[#d6d8d0] text-[#35463a]"}`}>
                Staff portal
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

