import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { SocialLinks } from "./SocialLinks";

export function SpellbLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="11" className="fill-coral" />
      <path d="M13 10h8.5a5.5 5.5 0 0 1 3.6 9.7A6 6 0 0 1 22 30h-9V10Zm4 4v4.5h4.3a2.25 2.25 0 0 0 0-4.5H17Zm0 8v4h5a2 2 0 0 0 0-4h-5Z" className="fill-cream" />
      <path d="M31 6l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1L31 6Z" className="fill-sun" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-3 sm:h-14 sm:px-5">
        <Link to="/" className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky" aria-label="Spellb home">
          <SpellbLogo />
          <span className="font-display text-xl font-extrabold text-ink">Spell<span className="text-coral">b</span></span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-bold" aria-label="Main">
          <Link to="/" activeOptions={{ exact: true }} className="rounded-full px-3 py-1.5 text-ink/65 hover:text-ink" activeProps={{ className: "bg-paper text-ink" }}>Stages</Link>
          <Link to="/phonics" className="rounded-full px-3 py-1.5 text-ink/65 hover:text-ink" activeProps={{ className: "bg-paper text-ink" }}>Phonics</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const [showLicense, setShowLicense] = useState(false);
  return (
    <footer className="border-t border-ink/5 bg-cream text-ink">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-5 text-center text-sm font-semibold text-ink/60 sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col gap-1">
          <p>© 2026 Spellb. All rights reserved.</p>
          <p>
            Licensed under the{" "}
            <button type="button" onClick={() => setShowLicense(true)} className="font-bold text-sky underline-offset-2 hover:underline">MIT License</button>
            {" · "}
            <a href="https://github.com/ramaeondev/spellb" target="_blank" rel="noopener noreferrer" className="font-bold text-sky underline-offset-2 hover:underline">Source on GitHub</a>
          </p>
        </div>
        <SocialLinks />
      </div>
      {showLicense && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label="MIT License" onClick={() => setShowLicense(false)}>
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-3xl bg-cream p-6 text-left text-sm text-ink/75" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-extrabold text-ink">MIT License</h2>
            <p className="mt-3">Copyright (c) 2026 Spellb</p>
            <p className="mt-3">Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
            <p className="mt-3">The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
            <p className="mt-3">THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            <button type="button" autoFocus onClick={() => setShowLicense(false)} className="mt-5 min-h-11 rounded-full bg-sky px-6 font-bold text-cream">Close</button>
          </div>
        </div>
      )}
    </footer>
  );
}
