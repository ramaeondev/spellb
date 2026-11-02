export type VoiceChoice =
  | "studio-indian-female"
  | "studio-indian-male"
  | "wasm-female"
  | "wasm-male"
  | "default"
  | "indian-female"
  | "indian-male"
  | "us"
  | "uk";

export const VOICE_OPTIONS: Array<{ value: VoiceChoice; label: string }> = [
  { value: "studio-indian-female", label: "Studio female · India" },
  { value: "studio-indian-male", label: "Studio male · India" },
  { value: "wasm-female", label: "On-device AI · female" },
  { value: "wasm-male", label: "On-device AI · male" },
  { value: "default", label: "Device voice (automatic)" },
  { value: "indian-female", label: "Device female · India" },
  { value: "indian-male", label: "Device male · India" },
  { value: "us", label: "Device voice · US" },
  { value: "uk", label: "Device voice · UK" },
];

/** Studio voices play pre-recorded clips; anything not recorded uses the matching device voice. */
const STUDIO_FALLBACK: Partial<Record<VoiceChoice, VoiceChoice>> = {
  "studio-indian-female": "indian-female",
  "studio-indian-male": "indian-male",
};
const STUDIO_FOLDER: Partial<Record<VoiceChoice, string>> = {
  "studio-indian-female": "indian-female",
  "studio-indian-male": "indian-male",
};
const PHRASE_FILES: Record<string, string> = {
  "Good! Correct!": "correct",
  "Oops! Try again.": "oops",
  "Oops! Let's learn this one.": "learn",
};

let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, HTMLAudioElement>();

function stopAll() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function playStudio(path: string, fallback: () => void) {
  stopAll();
  let audio = audioCache.get(path);
  if (!audio) {
    audio = new Audio(path);
    audio.preload = "auto";
    audioCache.set(path, audio);
  }
  audio.currentTime = 0;
  currentAudio = audio;
  audio.play().catch(() => {
    audioCache.delete(path);
    fallback();
  });
}

/** Warm the cache so the next prompt plays with no delay. */
export function preloadStudioPrompt(word: string, choice: VoiceChoice) {
  const folder = STUDIO_FOLDER[choice];
  if (!folder || typeof window === "undefined") return;
  const path = `/audio/${folder}/prompt/${word.toLowerCase()}.mp3`;
  if (audioCache.has(path)) return;
  const audio = new Audio(path);
  audio.preload = "auto";
  audioCache.set(path, audio);
}

function findVoice(choice: VoiceChoice) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  if (choice === "default") return voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

  const indian = voices.filter((voice) => voice.lang.toLowerCase().replace("_", "-") === "en-in" || /india/i.test(voice.name));
  const femaleName = /female|woman|veena|lekha|neerja|geeta|kavya|kalpana|swara|heera/i;
  const maleName = /\bmale\b|\bman\b|rishi|ravi|prabhat|ajay|madhav|hemant/i;
  if (choice === "indian-female") {
    return indian.find((voice) => femaleName.test(voice.name) && !/\bmale\b/i.test(voice.name)) ?? indian[0];
  }
  if (choice === "indian-male") {
    return indian.find((voice) => maleName.test(voice.name)) ?? indian.find((voice) => !femaleName.test(voice.name)) ?? indian[0];
  }
  const language = choice === "us" ? "en-us" : "en-gb";
  return voices.find((voice) => voice.lang.toLowerCase() === language) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

const VOICE_PROFILES: Record<VoiceChoice, { pitch: number; rate: number }> = {
  default: { pitch: 1.05, rate: 0.8 },
  "indian-female": { pitch: 1.12, rate: 0.82 },
  "indian-male": { pitch: 0.91, rate: 0.8 },
  us: { pitch: 1.05, rate: 0.8 },
  uk: { pitch: 1.05, rate: 0.8 },
};

function speakText(text: string, requested: VoiceChoice, cancelCurrent: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const choice = STUDIO_FALLBACK[requested] ?? requested;
  if (cancelCurrent) stopAll();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = findVoice(choice);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else if (choice.startsWith("indian")) {
    utterance.lang = "en-IN";
  }
  const profile = VOICE_PROFILES[choice];
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export function speakWord(word: string, choice: VoiceChoice = "default") {
  speakText(word, choice, true);
}

export function speakSpellingPrompt(word: string, choice: VoiceChoice = "default") {
  const text = `How do we spell ${word}?`;
  const folder = STUDIO_FOLDER[choice];
  if (folder) return playStudio(`/audio/${folder}/prompt/${word.toLowerCase()}.mp3`, () => speakText(text, choice, true));
  speakText(text, choice, true);
}

export function speakLetter(letter: string, choice: VoiceChoice = "default") {
  // Letters always use the instant device voice so typing never lags.
  if (currentAudio) stopAll();
  speakText(letter.toLowerCase(), choice, false);
}

export function speakFeedback(message: string, choice: VoiceChoice = "default") {
  const folder = STUDIO_FOLDER[choice];
  const phrase = PHRASE_FILES[message];
  if (folder && phrase) return playStudio(`/audio/${folder}/phrases/${phrase}.mp3`, () => speakText(message, choice, true));
  speakText(message, choice, true);
}