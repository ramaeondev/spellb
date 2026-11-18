import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Repeat2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PHONICS,
  PHONICS_GROUP_LABELS,
  PHONICS_GROUP_ORDER,
  type PhonicsEntry,
  type PhonicsGroup,
} from "@/data/phonics";
import { playPhonics, type VoiceChoice } from "@/lib/speech";
import { asset } from "@/lib/assets";

export const Route = createFileRoute("/phonics")({
  head: () => ({
    meta: [
      { title: "Phonics Board — Spelling Quest" },
      { name: "description", content: "Tap a tile to hear the pure sound letters make, then a sample word." },
      { property: "og:title", content: "Phonics Board — Spelling Quest" },
      { property: "og:description", content: "Tap a tile to hear the pure sound letters make, then a sample word." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhonicsBoard,
});

const FEMALE: VoiceChoice = "studio-indian-female";
const MALE: VoiceChoice = "studio-indian-male";

function PhonicsBoard() {
  const [voice, setVoice] = useState<VoiceChoice>(FEMALE);
  const [active, setActive] = useState<PhonicsEntry | null>(null);

  function play(entry: PhonicsEntry, choice = voice) {
    setActive(entry);
    playPhonics(entry.id, entry.sound, entry.word, choice);
  }

  const grouped = PHONICS_GROUP_ORDER.map((group: PhonicsGroup) => ({
    group,
    entries: PHONICS.filter((entry) => entry.group === group),
  }));

  return (
    <main className="quest-surface min-h-screen overflow-hidden px-3 py-5 text-ink sm:px-5 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-4 py-2.5 font-bold text-ink ring-1 ring-ink/5 transition hover:-translate-x-0.5 hover:bg-paper-strong"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Back
          </Link>
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
            Phonics <span className="text-coral">Board</span>
          </h1>
          <div className="flex items-center gap-1.5 rounded-full bg-cream p-1.5 ring-1 ring-ink/5" role="group" aria-label="Choose a voice">
            <button
              type="button"
              onClick={() => setVoice(FEMALE)}
              aria-pressed={voice === FEMALE}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition ${voice === FEMALE ? "bg-coral text-cream" : "text-ink/60 hover:bg-paper"}`}
            >
              Female voice
            </button>
            <button
              type="button"
              onClick={() => setVoice(MALE)}
              aria-pressed={voice === MALE}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition ${voice === MALE ? "bg-sky text-cream" : "text-ink/60 hover:bg-paper"}`}
            >
              Male voice
            </button>
          </div>
        </header>
        <p className="mx-auto mt-3 max-w-md text-center text-base font-semibold text-ink/60">
          <Sparkles aria-hidden="true" className="mr-1 inline size-4 text-sun" />
          Tap any tile to hear the sound it makes, then a word that starts with it.
        </p>

        {grouped.map(({ group, entries }) => (
          <section key={group} className="mt-7">
            <h2 className="font-display text-xl font-extrabold text-ink/75">{PHONICS_GROUP_LABELS[group]}</h2>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-2.5 md:grid-cols-8 lg:grid-cols-9">
              {entries.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => play(entry)}
                  aria-label={`Sound ${entry.sound}, as in ${entry.word}`}
                  className={`flex min-h-20 flex-col items-center justify-center rounded-2xl shadow-[0_4px_0_color-mix(in_oklab,var(--color-ink)_7%,transparent)] ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-[0_7px_0_color-mix(in_oklab,var(--color-ink)_7%,transparent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky active:translate-y-0.5 sm:min-h-24 ${index % 2 === 0 ? "bg-cream" : "bg-paper"}`}
                >
                  <span className="font-display text-2xl font-extrabold sm:text-3xl">{entry.display}</span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/45 sm:text-xs">{entry.word}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </section>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" onClick={() => setActive(null)}>
          <div
            role="dialog"
            aria-label={`Sound ${active.sound}, as in ${active.word}`}
            className="quest-pop relative w-full max-w-md rounded-[28px] bg-cream p-5 text-center shadow-xl ring-1 ring-ink/5 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xs overflow-hidden rounded-[20px] bg-paper ring-1 ring-ink/5">
              <img src={asset(active.image)} alt={`A picture of ${active.word}`} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <p className="mt-4 font-display text-6xl font-extrabold text-ink">{active.display}</p>
            <p className="mt-1 text-base font-bold text-ink/50">
              {active.ipa} · as in <span className="text-coral">{active.word}</span>
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Button
                type="button"
                onClick={() => play(active)}
                className="min-h-14 rounded-full bg-sky px-6 font-bold text-cream hover:bg-sky/90"
              >
                <Repeat2 aria-hidden="true" className="size-5" /> Play again
              </Button>
              <Button
                type="button"
                onClick={() => setActive(null)}
                className="min-h-14 rounded-full bg-ink px-6 font-bold text-cream hover:bg-ink/90"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground">
        Letter sounds from Open Letter Sounds (CC0). Some speech sounds from Wikimedia Commons IPA recordings (CC BY-SA).
      </p>
    </main>
  );
}
