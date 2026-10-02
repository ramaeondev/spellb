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

  const indian = voices.filter((voice) => voice.lang.toLowerCase() === "en-in");
  if (choice === "indian-female") {
    return indian.find((voice) => /female|woman|veena|lekha/i.test(voice.name)) ?? indian[0];
  }
  if (choice === "indian-male") {
    return indian.find((voice) => /male|man|rishi|heera/i.test(voice.name)) ?? indian[1] ?? indian[0];
  }
  const language = choice === "us" ? "en-us" : "en-gb";
  return voices.find((voice) => voice.lang.toLowerCase() === language) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

function speakText(text: string, choice: VoiceChoice, cancelCurrent: boolean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (cancelCurrent) window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = findVoice(choice);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.78;
  utterance.pitch = 1.08;
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
  speakText(letter, choice, false);
}

export function speakFeedback(message: string, choice: VoiceChoice = "default") {
  speakText(message, choice, true);
}