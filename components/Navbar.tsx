'use client';

import Link from 'next/link';
import { useState } from 'react';

function CardinalSVG({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cardinal bird"
    >
      {/* Branch */}
      <path d="M8 62 Q30 55 55 58 Q65 60 72 65" stroke="#4a6741" strokeWidth="3" strokeLinecap="round" />
      {/* Leaves on branch */}
      <ellipse cx="20" cy="57" rx="7" ry="3.5" fill="#7aad70" transform="rotate(-20 20 57)" />
      <ellipse cx="40" cy="54" rx="8" ry="3.5" fill="#5c9652" transform="rotate(10 40 54)" />
      <ellipse cx="62" cy="57" rx="6" ry="3" fill="#7aad70" transform="rotate(-10 62 57)" />
      {/* Body */}
      <ellipse cx="40" cy="46" rx="14" ry="10" fill="#c0392b" />
      {/* Head */}
      <circle cx="54" cy="38" r="9" fill="#c0392b" />
      {/* Crest (cardinal's distinctive feature) */}
      <path d="M54 29 L58 20 L55 28 L60 22 L57 30" fill="#c0392b" />
      {/* Wing detail */}
      <path d="M30 44 Q38 52 50 50" stroke="#a02820" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M32 48 Q40 55 52 53" stroke="#a02820" strokeWidth="1.5" strokeLinecap="round" />
      {/* Tail */}
      <path d="M26 50 L18 58 L28 54 L20 62 L30 55" fill="#a02820" />
      {/* Black mask */}
      <ellipse cx="58" cy="40" rx="7" ry="5" fill="#2c1810" opacity="0.7" />
      <ellipse cx="50" cy="40" rx="5" ry="4" fill="#2c1810" opacity="0.5" />
      {/* Eye */}
      <circle cx="57" cy="37" r="2" fill="#1a0f08" />
      <circle cx="57.8" cy="36.2" r="0.7" fill="white" />
      {/* Beak */}
      <path d="M63 39 L70 37 L63 41 Z" fill="#e8874a" />
      {/* Feet */}
      <path d="M38 56 L36 62" stroke="#8b6952" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 62 L33 63 M36 62 L37 64 M36 62 L39 63" stroke="#8b6952" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M44 56 L42 62" stroke="#8b6952" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 62 L39 63 M42 62 L43 64 M42 62 L45 63" stroke="#8b6952" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-sage shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 cardinal-flutter group-hover:animate-none">
              <CardinalSVG className="w-full h-full drop-shadow-sm" />
            </div>
            <div>
              <div className="text-orange-warm handwritten text-xl sm:text-2xl font-bold leading-tight">
                Nancy&apos;s Kitchen
              </div>
              <div className="text-sage-light text-xs tracking-widest uppercase font-lato hidden sm:block">
                Pavlik Family Recipes
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sage-muted hover:text-orange-warm transition-colors font-lato text-sm font-semibold tracking-wide uppercase"
            >
              All Recipes
            </Link>
            <Link
              href="/upload"
              className="flex items-center gap-2 bg-orange hover:bg-orange-warm text-white font-lato text-sm font-bold px-5 py-2 rounded-full transition-colors shadow-sm"
            >
              <span>+ Add Recipe</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-cream p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-cream transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-cream transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-cream transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-sage-light/30 pt-3 space-y-3">
            <Link
              href="/"
              className="block text-sage-light hover:text-orange-warm transition-colors font-lato text-sm font-semibold px-2"
              onClick={() => setMenuOpen(false)}
            >
              All Recipes
            </Link>
            <Link
              href="/upload"
              className="flex items-center gap-2 bg-orange text-white font-lato text-sm font-bold px-5 py-2 rounded-full w-fit"
              onClick={() => setMenuOpen(false)}
            >
              + Add Recipe
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
