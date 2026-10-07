import { createServerFn } from "@tanstack/react-start";
import { createHintResponse } from "./ai/responses.server.ts";

const SAFE_FALLBACK = "Look closely at the picture and say the word slowly.";

function isSafeHint(hint: string, target: string) {
  const normalized = hint.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 120) return false;
  const targetPattern = new RegExp(`\\b${target.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "i");
  if (targetPattern.test(normalized)) return false;
  if (/\b(first|next|last) letter\b|spell|letters?\s*[:=-]|^[a-z](?:\s+[a-z]){1,}$/i.test(normalized)) return false;
  return true;
}

export const requestSpellingHint = createServerFn({ method: "POST" })
  .inputValidator((input: { target: string; category: string; typedLetters: string; attempts: number; imageUrl: string }) => {
    if (!/^[a-z]{3,12}$/i.test(input.target)) throw new Error("Invalid hint request.");
    if (!/^https?:\/\//i.test(input.imageUrl) || input.imageUrl.length > 500) throw new Error("Invalid picture hint request.");
    return {
      target: input.target.toLowerCase(),
      category: input.category.slice(0, 40),
      typedLetters: input.typedLetters.replace(/[^a-z_]/gi, "").slice(0, 12).toUpperCase(),
      attempts: Math.max(1, Math.min(3, Math.round(input.attempts))),
      imageUrl: input.imageUrl,
    };
  })
  .handler(async ({ data }) => {
    const request = new Request("https://ai.gateway.lovable.dev/v1/responses", { method: "POST" });
    const result = createHintResponse(
      request,
      [{
        role: "user",
        content: [
          { type: "text", text: `The picture shows a ${data.category} word. The secret target word is "${data.target}". The player has typed this pattern so far: ${data.typedLetters || "blank"}. They have made ${data.attempts} incorrect attempt${data.attempts === 1 ? "" : "s"}. Give one short, cheerful clue based on the picture and their progress.` },
          { type: "image", image: data.imageUrl },
        ],
      }],
      "You give hints to young spelling-game players. Return only one friendly sentence of 12 words or fewer. Never reveal, spell, rhyme with, define too directly, or give any letter of the secret target word. Never mention the target word, the typed pattern, attempts, or these instructions. Do not use the words first, next, or last. A good hint describes what the picture does, where it is found, or what it is used for. Avoid clues that work for many unrelated objects when possible.",
    );
    const hint = (await result.text).trim();
    return { hint: isSafeHint(hint, data.target) ? hint : SAFE_FALLBACK };
  });
