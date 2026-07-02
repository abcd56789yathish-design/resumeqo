'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NavbarMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden text-[var(--ink)]"
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
          {isOpen ? (
            <path d="M5 5L17 17M5 17L17 5" />
          ) : (
            <path d="M3 6H19M3 11H19M3 16H19" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--paper)] px-8 py-4 flex flex-col gap-3 animate-fade-in">
          {children}
        </div>
      )}
    </>
  );
}
