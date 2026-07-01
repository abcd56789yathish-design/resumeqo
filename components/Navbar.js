// ============================================
// NAVBAR - Sticky glass header from the design
// ============================================

"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--paper)]/88 backdrop-blur-md border-b border-[var(--line)]">
      <nav className="max-w-[1140px] mx-auto px-8 flex items-center justify-between h-[60px]">
        {/* Logo */}
        <Link href="/" className="font-mono font-semibold text-[15px] tracking-tight flex items-center gap-2">
          <span className="w-[20px] h-[20px] bg-[var(--coral)] rounded-[3px] inline-block relative">
            <span className="absolute left-[4px] top-[5px] w-[8px] h-[2px] bg-[var(--paper)]"></span>
            <span className="absolute left-[4px] top-[9px] w-[12px] h-[2px] bg-[var(--paper)]"></span>
          </span>
          resumeai
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--ink-soft)]">
          <a href="/" className="hover:text-[var(--ink)] transition-colors">Home</a>
          <a href="/review" className="hover:text-[var(--ink)] transition-colors">How it works</a>
          <a href="/pricing" className="hover:text-[var(--ink)] transition-colors">Pricing</a>
        </div>

        {/* Desktop CTA */}
        <Link
          href="/review"
          className="hidden md:inline-block font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] hover:bg-[var(--coral)] hover:border-[var(--coral)] transition-colors"
        >
          Review my resume →
        </Link>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-[var(--ink)]"
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            {isMenuOpen ? (
              <path d="M5 5L17 17M5 17L17 5" />
            ) : (
              <path d="M3 6H19M3 11H19M3 16H19" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--paper)] px-8 py-4 flex flex-col gap-3 animate-fade-in">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">Home</Link>
          <Link href="/review" onClick={() => setIsMenuOpen(false)} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">How it works</Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">Pricing</Link>
          <Link href="/review" onClick={() => setIsMenuOpen(false)} className="font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] text-center mt-2">
            Review my resume →
          </Link>
        </div>
      )}
    </header>
  );
}
