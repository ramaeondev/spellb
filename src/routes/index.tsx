import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Lightbulb, LoaderCircle, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STAGE_WORDS, type WordEntry, type WordStage, validateWordBank } from "@/data/words";
import { WORD_TIPS } from "@/data/word-tips";
import { VOICE_OPTIONS, speakFeedback, speakLetter, speakSpellingPrompt, speakWord, type VoiceChoice } from "@/lib/speech";
import { requestSpellingHint } from "@/lib/hint.functions";
import { recordValidationEvent, startValidationSession } from "@/lib/session-tracking";

type Feedback = "idle" | "wrong" | "correct" | "revealed" | "skipped";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spelling Quest — Look. Listen. Spell!" },
      { name: "description", content: "Choose a stage and practice spelling 100 picture-supported words." },
      { property: "og:title", content: "Spelling Quest — Look. Listen. Spell!" },
      { property: "og:description", content: "Choose a stage and practice spelling 100 picture-supported words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpellingQuest,
});

const stageColors = ["bg-sun/25", "bg-sky/25", "bg-coral/20", "bg-sky/25", "bg-coral/20", "bg-ink/10"];
const stageDescriptions = ["Start with the little words.", "A few more letters to explore.", "Ready for a bigger challenge?", "Keep your spelling streak going.", "Take on the longest words!", "A surprise word from the whole quest!"];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    const target = copy[j];
    if (current && target) {
      copy[i] = target;
      copy[j] = current;
    }
  }
  return copy;
}

function imageBlobToPngDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 384;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Picture unavailable"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Picture unavailable"));
    };
    image.src = objectUrl;
  });
}

function SpellingQuest() {
  const [stage, setStage] = useState<WordStage | null>(null);
  const [session, setSession] = useState<WordEntry[]>([]);
  const [position, setPosition] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [earnedStars, setEarnedStars] = useState(0);
  const [lastStars, setLastStars] = useState(0);
  const [finished, setFinished] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [voice, setVoice] = useState<VoiceChoice>("default");
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState(false);
  const [hasMistake, setHasMistake] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const validationSessionId = useRef<string | undefined>(undefined);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const getHint = useServerFn(requestSpellingHint);

  const current = session[position];
  const progress = session.length ? Math.min(position + 1, session.length) : 0;

  useEffect(() => {
    if (!validateWordBank()) console.error("Spelling Quest word bank failed validation.");
  }, []);

  useEffect(() => {
    if (!current || finished) return;
    setLetters(Array.from({ length: current.word.length }, () => ""));
    setAttempts(0);
    setFeedback("idle");
    setImageFailed(false);
    setHint(null);
    setHintCount(0);
    setHintLoading(false);
    setHintError(false);
    setHasMistake(false);
    const timer = window.setTimeout(() => {
      inputRefs.current[0]?.focus();
      speakSpellingPrompt(current.word, voice);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [current, finished]);

  const totalStars = useMemo(() => "★".repeat(Math.min(3, lastStars)) + "☆".repeat(3 - Math.min(3, lastStars)), [lastStars]);

  function startStage(nextStage: WordStage) {
    setStage(nextStage);
    const words = nextStage === 7
      ? [STAGE_WORDS[7][Math.floor(Math.random() * STAGE_WORDS[7].length)]].filter((entry): entry is WordEntry => Boolean(entry))
      : shuffle(STAGE_WORDS[nextStage]);
    setSession(words);
    setPosition(0);
    setEarnedStars(0);
    setLastStars(0);
    setFinished(false);
    void startValidationSession(String(nextStage)).then((sessionInfo) => {
      validationSessionId.current = sessionInfo.sessionId;
    });
  }

  function goHome() {
    window.speechSynthesis?.cancel();
    setStage(null);
    setSession([]);
    setFinished(false);
  }

  function updateLetter(index: number, value: string) {
    if (feedback !== "idle") return;
    const next = value.replace(/[^a-z]/gi, "").slice(-1).toUpperCase();
    const nextLetters = [...letters];
    if (!next) {
      nextLetters[index] = "";
      setLetters(nextLetters);
      return;
    }

    if (next !== current?.word[index]?.toUpperCase()) {
      nextLetters[index] = next;
      setLetters(nextLetters);
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      recordValidationEvent(validationSessionId.current ?? "", current?.id ?? "", "answered");
      if (nextAttempts >= 3) {
        setHasMistake(false);
        setHint(null);
        setLastStars(0);
        setFeedback("revealed");
        speakFeedback("Oops! Let's learn this one.", voice);
      } else {
        setFeedback("wrong");
        setHasMistake(true);
        setHint(null);
        setHintError(false);
        speakFeedback("Oops! Try again.", voice);
        window.setTimeout(() => {
          setLetters((currentLetters) => currentLetters.map((letter, letterIndex) => letterIndex === index && letter === next ? "" : letter));
          setFeedback("idle");
          inputRefs.current[index]?.focus();
        }, 850);
      }
      return;
    }

    nextLetters[index] = next;
    setLetters(nextLetters);
    speakLetter(next, voice);
    if (next && index < nextLetters.length - 1) inputRefs.current[index + 1]?.focus();
    if (nextLetters.every(Boolean)) window.setTimeout(() => checkAnswer(nextLetters), 450);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !letters[index] && index > 0) {
      event.preventDefault();
      const next = [...letters];
      next[index - 1] = "";
      setLetters(next);
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < letters.length - 1) inputRefs.current[index + 1]?.focus();
  }

  function resetForRetry() {
    setLetters(Array.from({ length: current?.word.length ?? 0 }, () => ""));
    window.setTimeout(() => inputRefs.current[0]?.focus(), 80);
  }

  function checkAnswer(answer = letters) {
    if (!current || feedback !== "idle" || answer.some((letter) => !letter)) return;
    if (answer.join("").toLowerCase() !== current.word) return;
    const stars = attempts === 0 ? 3 : attempts === 1 ? 2 : 1;
    setLastStars(stars);
    setEarnedStars((score) => score + stars);
    setFeedback("correct");
    setHasMistake(false);
    recordValidationEvent(validationSessionId.current ?? "", current.id, "answered");
    speakFeedback("Good! Correct!", voice);
    window.setTimeout(advance, 1400);
  }

  function advance() {
    if (position >= session.length - 1) {
      setFinished(true);
      return;
    }
    setPosition((value) => value + 1);
  }

  function skipWord() {
    if (!current || feedback !== "idle") return;
    recordValidationEvent(validationSessionId.current ?? "", current.id, "skipped");
    window.speechSynthesis?.cancel();
    setFeedback("skipped");
    window.setTimeout(advance, 500);
  }

  async function requestHint() {
    if (!current || !hasMistake || hintLoading) return;
    setHintError(false);
    const offline = WORD_TIPS[current.word];
    if (offline && hintCount < offline.length) {
      const tip = offline[hintCount];
      setHintCount((count) => count + 1);
      setHint(tip);
      speakFeedback(tip, voice);
      return;
    }
    setHintLoading(true);
    try {
      const imageResponse = await fetch(current.image);
      if (!imageResponse.ok) throw new Error("Picture unavailable");
      const imageBlob = await imageResponse.blob();
      const imageData = await imageBlobToPngDataUrl(imageBlob);
      const result = await getHint({
        data: {
          target: current.word,
          category: current.category,
          typedLetters: letters.map((letter) => letter || "_").join(""),
          attempts,
          imageData,
        },
      });
      setHint(result.hint);
      speakFeedback(result.hint, voice);
    } catch {
      setHintError(true);
    } finally {
      setHintLoading(false);
    }
  }

  if (!stage) return <StageSelect onSelect={startStage} />;
  if (finished) return <Completion stage={stage} stars={earnedStars} onPlayAgain={() => startStage(stage)} onNext={() => stage < 5 ? startStage((stage + 1) as WordStage) : goHome()} onHome={goHome} />;
  if (!current) return <StageSelect onSelect={startStage} />;

  return (
    <main className="quest-surface min-h-screen overflow-hidden px-3 py-4 text-ink sm:px-5 sm:py-12">
      <section className="mx-auto max-w-3xl rounded-[28px] bg-cream p-4 shadow-[0_18px_0_color-mix(in_oklab,var(--color-ink)_8%,transparent)] ring-1 ring-ink/5 sm:rounded-[32px] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={goHome} className="min-h-12 rounded-full bg-paper px-4 py-2.5 font-bold text-ink ring-1 ring-ink/5 hover:-translate-x-0.5 hover:bg-paper-strong">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back
          </Button>
          <div className="text-center">
            <p className="font-display text-xl font-extrabold leading-none">Stage {stage}</p>
           <p className="mt-1 text-sm font-bold text-ink/55">Word {progress} of {stage === 7 ? 1 : 100}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sun" aria-label={`${earnedStars} stars earned`}>
            <span aria-hidden="true" className="text-lg">★</span><span className="text-sm font-extrabold text-ink">{earnedStars}</span>
          </div>
        </div>
         <div className="mt-5 h-3 overflow-hidden rounded-full bg-paper ring-1 ring-ink/5" aria-label={`${progress} of ${stage === 7 ? 1 : 100} words completed`} role="progressbar" aria-valuemin={0} aria-valuemax={stage === 7 ? 1 : 100} aria-valuenow={progress}>
           <div className="h-full rounded-full bg-gradient-to-r from-sky to-coral transition-all duration-500" style={{ width: `${(progress / (stage === 7 ? 1 : 100)) * 100}%` }} />
        </div>
        <div className="mt-5 grid place-items-center sm:mt-7">
          <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[20px] bg-paper ring-1 ring-ink/5 sm:max-w-md sm:rounded-[24px]">
            {imageFailed ? <div className="grid h-full place-items-center text-7xl" aria-label="A friendly picture">{current?.category === "animals" ? "🐾" : "⭐"}</div> : <img src={current?.image} alt="A picture clue for the spelling word" className="h-full w-full object-cover" onError={() => setImageFailed(true)} />}
          </div>
        </div>
        <div className="mt-5 flex justify-center">
           <Button type="button" onClick={() => current && speakSpellingPrompt(current.word, voice)} className="min-h-14 rounded-full bg-sky px-6 py-3 text-base font-bold text-cream shadow-sm hover:scale-105 hover:bg-sky/90">
            <Volume2 aria-hidden="true" className="size-5" /> Hear Again
          </Button>
        </div>
         <div className="mx-auto mt-3 flex max-w-md flex-col gap-2 text-left sm:mt-4">
           <label htmlFor="voice-choice" className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink/50">Listening voice</label>
           <select id="voice-choice" value={voice} onChange={(event) => setVoice(event.target.value as VoiceChoice)} className="min-h-14 rounded-2xl bg-paper px-4 py-3 font-bold text-ink outline-none ring-1 ring-ink/10 focus:ring-4 focus:ring-sky">
             {VOICE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
           </select>
           <p className="text-xs font-semibold text-ink/45">Indian voices appear when your device provides them.</p>
         </div>
        <div className="mx-auto mt-6 grid w-full max-w-[18rem] grid-cols-4 justify-items-center gap-2 sm:mt-7 sm:flex sm:max-w-none sm:justify-center sm:gap-3" role="group" aria-label={`Spell the word, ${current?.word.length ?? 0} letters`}>
          {letters.map((letter, index) => <input key={`${current?.id}-${index}`} ref={(element) => { inputRefs.current[index] = element; }} value={letter} maxLength={1} inputMode="text" autoCapitalize="characters" aria-label={`Letter ${index + 1}`} aria-invalid={feedback === "wrong" && letter !== current?.word[index]?.toUpperCase()} onChange={(event) => updateLetter(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} className={`size-16 rounded-2xl bg-paper text-center font-display text-3xl font-extrabold text-ink outline-none ring-2 transition focus:ring-4 ${feedback === "wrong" && letter !== current?.word[index]?.toUpperCase() ? "ring-coral focus:ring-coral" : "ring-sky/70 focus:ring-sky"}`} />)}
        </div>
         <div className="mt-5 flex justify-center">
           <Button type="button" variant="ghost" onClick={skipWord} className="min-h-12 rounded-full bg-paper px-5 py-2.5 font-bold text-ink/65 ring-1 ring-ink/10 hover:bg-paper-strong hover:text-ink">
             <SkipForward aria-hidden="true" className="size-4" /> Skip this word
           </Button>
         </div>
        <div className="mt-6 flex min-h-28 flex-col items-center justify-center gap-3" aria-live="polite">
          {feedback === "wrong" && <div className="quest-pop inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 font-display text-2xl font-extrabold text-cream"><span aria-hidden="true">✕</span> OOPS! TRY AGAIN</div>}
          {feedback === "correct" && <><div className="quest-pop inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 font-display text-2xl font-extrabold text-cream"><span aria-hidden="true">🎉</span> GOOD! CORRECT!</div><RevealWord word={current.word} stars={totalStars} /></>}
          {feedback === "revealed" && <><div className="quest-pop inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 font-display text-2xl font-extrabold text-cream"><span aria-hidden="true">✕</span> LET'S LEARN IT!</div><RevealWord word={current.word} stars="☆☆☆" /><Button type="button" onClick={advance} className="min-h-14 rounded-full bg-sky px-7 py-3 text-base font-bold text-cream hover:scale-105 hover:bg-sky/90">Next Word <ArrowRight aria-hidden="true" className="size-5" /></Button></>}
           {feedback === "skipped" && <div className="quest-pop inline-flex items-center gap-2 rounded-full bg-sky px-6 py-3 font-display text-2xl font-extrabold text-cream"><SkipForward aria-hidden="true" className="size-6" /> SKIPPED</div>}
          {(hasMistake || hint || hintLoading || hintError) && <div className="flex flex-col items-center gap-2">
            {hint && <p className="max-w-md rounded-2xl bg-sun/20 px-4 py-2 text-center text-base font-extrabold text-ink" role="status"><span aria-hidden="true">💡</span> {hint}</p>}
            {hintError && <p className="text-sm font-bold text-coral" role="status">The hint is taking a break. Try again.</p>}
            <Button type="button" variant="ghost" onClick={requestHint} disabled={hintLoading} className="rounded-full bg-sun/25 px-5 py-2.5 font-bold text-ink ring-1 ring-sun/40 hover:bg-sun/35 disabled:cursor-wait disabled:opacity-70">
              {hintLoading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Lightbulb aria-hidden="true" className="size-4" />}
              {hintLoading ? "Thinking..." : hint ? "Try another hint" : "Get a hint"}
            </Button>
          </div>}
        </div>
         <p className="mt-3 text-center text-sm font-bold text-ink/45">{feedback === "idle" ? "How do we spell it?" : feedback === "wrong" ? "That letter didn't match. Try this spot again." : feedback === "skipped" ? "No problem—let’s try a new one." : "Great learning!"}</p>
      </section>
    </main>
  );
}

function RevealWord({ word, stars }: { word: string; stars: string }) {
  return <div className="quest-rise text-center"><div className="flex flex-wrap justify-center gap-1.5">{word.toUpperCase().split("").map((letter, index) => <span key={`${letter}-${index}`} className="grid size-10 place-items-center rounded-xl bg-paper font-display text-xl font-extrabold text-ink">{letter}</span>)}</div><p className="mt-2 text-base font-bold text-ink/70">{word} <span className="ml-1 text-sun">{stars}</span></p></div>;
}

function StageSelect({ onSelect }: { onSelect: (stage: WordStage) => void }) {
  const stages: WordStage[] = [1, 2, 3, 4, 5, 7];
  return <main className="quest-surface min-h-screen overflow-hidden px-4 py-8 text-ink sm:px-5 sm:py-16"><div className="relative mx-auto max-w-5xl"><div className="pointer-events-none absolute -left-2 top-0 text-3xl text-sun quest-float" aria-hidden="true">★</div><div className="pointer-events-none absolute right-0 top-14 text-2xl text-sky quest-float" aria-hidden="true">★</div><header className="text-center"><span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-sm font-bold uppercase tracking-[0.18em] text-coral ring-1 ring-ink/5"><span aria-hidden="true">★</span> A spelling adventure</span><h1 className="mt-5 font-display text-4xl font-extrabold leading-none sm:text-6xl">Spelling <span className="text-coral">Quest</span></h1><p className="mx-auto mt-3 max-w-[30ch] text-lg font-semibold text-ink/70 sm:text-xl">Look. Listen. Spell!</p></header><div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">{stages.map((item) => <button key={item} type="button" onClick={() => onSelect(item)} className="group relative flex min-h-40 flex-col items-start rounded-[24px] bg-cream p-5 text-left shadow-[0_8px_0_color-mix(in_oklab,var(--color-ink)_7%,transparent)] ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-[0_11px_0_color-mix(in_oklab,var(--color-ink)_7%,transparent)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky sm:min-h-0 sm:rounded-[28px] sm:p-6"><div className="flex w-full items-center justify-between"><span className="font-display text-2xl font-extrabold">Stage {item}</span><span className={`rounded-full ${stageColors[item === 7 ? 5 : item - 1]} px-3 py-1 text-sm font-bold text-ink/80`}>{item === 7 ? "Mixed lengths" : `${item + 2} letters`}</span></div><p className="mt-3 text-base font-semibold text-ink/60 sm:mt-4">{stageDescriptions[item === 7 ? 5 : item - 1]}</p><div className="mt-auto flex w-full items-center justify-between pt-5"><span className="text-sm font-bold text-sky">{item === 7 ? "1 random word" : "100 words"}</span><span className="inline-flex min-h-11 items-center gap-1 rounded-full bg-coral px-4 py-2 text-sm font-bold text-cream transition-transform group-hover:scale-105">Play <ArrowRight aria-hidden="true" className="size-4" /></span></div></button>)}<div className="flex flex-col items-start justify-center rounded-[24px] bg-ink p-5 text-cream ring-1 ring-ink/5 sm:rounded-[28px] sm:p-6"><span className="font-display text-xl font-extrabold">Collect stars</span><p className="mt-2 text-sm font-semibold text-cream/70">Spell it right on the first try to earn three stars. Every word is a new discovery.</p><div className="mt-4 flex gap-1 text-2xl text-sun" aria-hidden="true">★★★</div></div></div></div></main>;
}

function Completion({ stage, stars, onPlayAgain, onNext, onHome }: { stage: WordStage; stars: number; onPlayAgain: () => void; onNext: () => void; onHome: () => void }) {
  const wordCount = stage === 7 ? 1 : 100;
  const maxStars = wordCount * 3;
  return <main className="quest-surface flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 text-ink"><section className="quest-rise w-full max-w-lg rounded-[32px] bg-cream p-8 text-center shadow-[0_18px_0_color-mix(in_oklab,var(--color-ink)_8%,transparent)] ring-1 ring-ink/5"><div className="text-5xl" aria-hidden="true">🎉</div><h1 className="mt-3 font-display text-4xl font-extrabold text-coral sm:text-5xl">STAGE COMPLETE!</h1><p className="mt-2 font-display text-2xl font-bold text-ink/60">{wordCount} / {wordCount}</p><div className="mt-5 flex justify-center gap-1 text-4xl text-sun" aria-label={`${stars} of ${maxStars} stars earned`}>{[0,1,2,3,4].map((index) => <span key={index} aria-hidden="true">{index < Math.round((stars / Math.max(1, maxStars)) * 5) ? "★" : "☆"}</span>)}</div><p className="mt-4 text-lg font-bold text-ink/70">Great spelling practice!</p><p className="mt-1 text-sm font-semibold text-ink/50">You earned {stars} of {maxStars} stars in Stage {stage}.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center"><Button type="button" onClick={onPlayAgain} className="rounded-full bg-sky px-7 py-3.5 font-bold text-cream hover:bg-sky/90">Play Again</Button>{stage < 5 ? <Button type="button" onClick={onNext} className="rounded-full bg-coral px-7 py-3.5 font-bold text-cream hover:bg-coral/90">Next Stage <ArrowRight aria-hidden="true" className="size-4" /></Button> : <Button type="button" onClick={onHome} className="rounded-full bg-ink px-7 py-3.5 font-bold text-cream hover:bg-ink/90">Back to Stages</Button>}</div></section></main>;
}