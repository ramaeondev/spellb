import { asset } from "@/lib/assets";

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

/** On-device AI voices run in the browser (WASM); the model downloads once and is stored locally. */
const WASM_VOICE: Partial<Record<VoiceChoice, string>> = {
  "wasm-female": "en_US-lessac-medium",
  "wasm-male": "en_US-ryan-medium",
};
const WASM_FALLBACK: Partial<Record<VoiceChoice, VoiceChoice>> = {
  "wasm-female": "indian-female",
  "wasm-male": "indian-male",
};
const PHRASE_FILES: Record<string, string> = {
  "Good! Correct!": "correct",
  "Oops! Try again.": "oops",
  "Oops! Let's learn this one.": "learn",
};

let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, HTMLAudioElement>();

export interface ModelLoadingState {
  loading: boolean;
  voiceId?: string;
  percent?: number | undefined;
}

type ModelLoadListener = (state: ModelLoadingState) => void;
const modelListeners = new Set<ModelLoadListener>();

export function onModelLoading(listener: ModelLoadListener) {
  modelListeners.add(listener);
  return () => {
    modelListeners.delete(listener);
  };
}

function notifyModelLoading(state: ModelLoadingState) {
  for (const listener of modelListeners) {
    try {
      listener(state);
    } catch (error) {
      console.error("Model loading listener failed.", error);
    }
  }
}

function stopAll() {
  playToken += 1;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function playStudio(path: string, fallback: () => void, onEnded?: () => void) {
  stopAll();
  let audio = audioCache.get(path);
  if (!audio) {
    audio = new Audio(path);
    audio.preload = "auto";
    audioCache.set(path, audio);
  }
  audio.currentTime = 0;
  currentAudio = audio;
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
    onEnded?.();
  };
  audio.play().catch(() => {
    audioCache.delete(path);
    fallback();
  });
}

/** Phonics tiles: play the pure sound recording, then the sample word. */
/** Sounds with a natural open-licensed recording (CC0 Open Letter Sounds + Wikimedia IPA clips). */
const OPEN_PHONICS = new Set<string>(["a","ar","bl","b","br","ch","ck","cl","c","cr","d","dr","ee","e","er","fl","f","fr","gl","g","gr","h","i","ir","j","k","l","m","ng","n","o","oo","or","ph","pl","p","pr","q","r","sc","sh","sk","sl","sm","s","sn","sp","st","sw","th","t","tr","tw","u","ur","v","wh","w","x","y","z"]);

export function playPhonics(id: string, soundText: string, word: string, choice: VoiceChoice = "default") {
  const folder = STUDIO_FOLDER[choice];
  if (!folder) {
    stopAll();
    speakText(soundText, choice, false);
    speakText(word, choice, false);
    return;
  }
  playStudio(
    asset(OPEN_PHONICS.has(id) ? `/audio/phonics-open/${id}.mp3` : `/audio/${folder}/phonics/${id}.mp3`),
    () => speakText(`${soundText} ${word}`, choice, true),
    () =>
      playStudio(asset(`/audio/${folder}/phonics/${id}-word.mp3`), () => speakText(word, choice, true)),
  );
}

/** Warm the cache so the next prompt plays with no delay. */
export function preloadStudioPrompt(word: string, choice: VoiceChoice) {
  const folder = STUDIO_FOLDER[choice];
  if (!folder || typeof window === "undefined") return;
  const path = asset(`/audio/${folder}/prompt/${word.toLowerCase()}.mp3`);
  if (audioCache.has(path)) return;
  const audio = new Audio(path);
  audio.preload = "auto";
  audioCache.set(path, audio);
}

/** Warm whichever engine the chosen voice uses: studio clip cache or the on-device AI model. */
export function preloadVoice(word: string, choice: VoiceChoice) {
  const folder = STUDIO_FOLDER[choice];
  if (folder) return word ? preloadStudioPrompt(word, choice) : undefined;
  const voiceId = WASM_VOICE[choice];
  if (voiceId && typeof window !== "undefined") getPiperSession(voiceId).catch(() => {});
}

// ---- On-device AI (WASM) voices ----

type PiperModule = typeof import("@jtsage/piper-tts-web");
type PiperSession = Awaited<ReturnType<PiperModule["TtsSession"]["create"]>>;

let piperModule: PiperModule | null = null;
const piperSessions = new Map<string, Promise<PiperSession>>();
let activeVoiceId: string | null = null;
/** Incremented whenever playback stops; stale synthesis results are discarded. */
let playToken = 0;

function getPiperSession(voiceId: string): Promise<PiperSession> {
  let entry = piperSessions.get(voiceId);
  if (!entry) {
    entry = (async () => {
      if (!piperModule) piperModule = await import("@jtsage/piper-tts-web");
      if (activeVoiceId && activeVoiceId !== voiceId && piperModule.TtsSession._instance) {
        piperModule.TtsSession._instance = null;
      }
      activeVoiceId = voiceId;

      notifyModelLoading({ loading: true, voiceId, percent: 0 });

      const fileReader = new piperModule.CachedFileReader({
        progress: (progress) => {
          const percent =
            progress.total > 0
              ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
              : undefined;
          notifyModelLoading({ loading: true, voiceId, percent });
        },
      });

      try {
        const session = await piperModule.TtsSession.create({ voiceId, fileReader });
        notifyModelLoading({ loading: false, voiceId, percent: 100 });
        return session;
      } catch (error) {
        notifyModelLoading({ loading: false, voiceId });
        throw error;
      }
    })();
    entry.catch(() => {
      piperSessions.delete(voiceId);
      notifyModelLoading({ loading: false, voiceId });
    });
    piperSessions.set(voiceId, entry);
  }
  return entry;
}

async function playWasm(text: string, voiceId: string, fallback: () => void) {
  if (typeof window === "undefined") {
    fallback();
    return;
  }
  stopAll();
  const token = playToken;
  try {
    const session = await getPiperSession(voiceId);
    const wav = await session.predict(text);
    if (token !== playToken) return;
    const url = URL.createObjectURL(wav);
    const audio = new Audio(url);
    if (voiceId.includes("lessac")) audio.playbackRate = 1.08;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (currentAudio === audio) currentAudio = null;
    };
    currentAudio = audio;
    await audio.play();
  } catch {
    piperSessions.delete(voiceId);
    if (token === playToken) fallback();
  }
}

function findVoice(choice: VoiceChoice) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return undefined;
  if (choice === "default")
    return voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

  const indian = voices.filter(
    (voice) => voice.lang.toLowerCase().replace("_", "-") === "en-in" || /india/i.test(voice.name),
  );
  const femaleName = /female|woman|veena|lekha|neerja|geeta|kavya|kalpana|swara|heera/i;
  const maleName = /\bmale\b|\bman\b|rishi|ravi|prabhat|ajay|madhav|hemant/i;
  if (choice === "indian-female") {
    return (
      indian.find((voice) => femaleName.test(voice.name) && !/\bmale\b/i.test(voice.name)) ??
      indian[0]
    );
  }
  if (choice === "indian-male") {
    return (
      indian.find((voice) => maleName.test(voice.name)) ??
      indian.find((voice) => !femaleName.test(voice.name)) ??
      indian[0]
    );
  }
  const language = choice === "us" ? "en-us" : "en-gb";
  return (
    voices.find((voice) => voice.lang.toLowerCase() === language) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("en"))
  );
}

const VOICE_PROFILES: Record<VoiceChoice, { pitch: number; rate: number }> = {
  "studio-indian-female": { pitch: 1.12, rate: 0.82 },
  "studio-indian-male": { pitch: 0.91, rate: 0.8 },
  default: { pitch: 1.05, rate: 0.8 },
  "indian-female": { pitch: 1.12, rate: 0.82 },
  "indian-male": { pitch: 0.91, rate: 0.8 },
  "wasm-female": { pitch: 1.0, rate: 0.85 },
  "wasm-male": { pitch: 1.0, rate: 0.85 },
  us: { pitch: 1.05, rate: 0.8 },
  uk: { pitch: 1.05, rate: 0.8 },
};

function speakText(text: string, requested: VoiceChoice, cancelCurrent: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const choice = STUDIO_FALLBACK[requested] ?? WASM_FALLBACK[requested] ?? requested;
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

function wasmRoute(text: string, choice: VoiceChoice): boolean {
  const voiceId = WASM_VOICE[choice];
  if (!voiceId) return false;
  const fallbackChoice = WASM_FALLBACK[choice] ?? "default";
  playWasm(text, voiceId, () => speakText(text, fallbackChoice, true));
  return true;
}

export function speakWord(word: string, choice: VoiceChoice = "default") {
  if (wasmRoute(word, choice)) return;
  speakText(word, choice, true);
}

export function speakSpellingPrompt(word: string, choice: VoiceChoice = "default") {
  const text = `How do we spell ${word}?`;
  const folder = STUDIO_FOLDER[choice];
  if (folder)
    return playStudio(asset(`/audio/${folder}/prompt/${word.toLowerCase()}.mp3`), () =>
      speakText(text, choice, true),
    );
  if (wasmRoute(text, choice)) return;
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
  if (folder && phrase)
    return playStudio(asset(`/audio/${folder}/phrases/${phrase}.mp3`), () =>
      speakText(message, choice, true),
    );
  if (wasmRoute(message, choice)) return;
  speakText(message, choice, true);
}
