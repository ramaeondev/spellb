export type VoiceChoice = "default" | "indian-female" | "indian-male" | "us" | "uk";

export const VOICE_OPTIONS: Array<{ value: VoiceChoice; label: string }> = [
  { value: "default", label: "Friendly voice (automatic)" },
  { value: "indian-female", label: "Female voice · India" },
  { value: "indian-male", label: "Male voice · India" },
  { value: "us", label: "English voice · US" },
  { value: "uk", label: "English voice · UK" },
];

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

function speakText(text: string, choice: VoiceChoice, cancelCurrent: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (cancelCurrent) window.speechSynthesis.cancel();
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
  speakText(`How do we spell ${word}?`, choice, true);
}

export function speakLetter(letter: string, choice: VoiceChoice = "default") {
  speakText(letter.toLowerCase(), choice, false);
}

export function speakFeedback(message: string, choice: VoiceChoice = "default") {
  speakText(message, choice, true);
}