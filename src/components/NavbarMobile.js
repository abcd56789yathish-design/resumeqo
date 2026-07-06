'use client';

import { useState } from 'react';

export default function NavbarMobile({ user, links }) {
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
        <div className="absolute top-full left-0 w-full border-t border-[var(--line)] bg-[var(--paper)] px-8 py-4 flex flex-col gap-3 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">{l.label}</a>
          ))}
          {user ? (
            <>
              <span className="text-sm text-[var(--ink-soft)]">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="font-mono text-[13px] font-medium bg-[var(--coral)] text-white px-[18px] py-[10px] rounded-[3px] text-center mt-2 w-full">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <a href="/login" className="font-mono text-[13px] font-medium bg-[var(--ink)] text-[var(--paper)] px-[18px] py-[10px] rounded-[3px] border border-[var(--ink)] text-center mt-2 block">
              Sign in ?
            </a>
          )}
        </div>
      )}
    </>
  );
}
