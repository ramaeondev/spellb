import { describe, expect, it } from "vitest";
import { GAME_TIMINGS } from "@/routes/index";

describe("gameplay timings", () => {
  it("validates the final letter within 180ms", () => expect(GAME_TIMINGS.validation).toBe(180));
  it("shows wrong-letter feedback for 450ms", () => expect(GAME_TIMINGS.wrongAnswerFeedback).toBe(450));
  it("auto-advances after success at 1200ms", () => expect(GAME_TIMINGS.successAutoAdvance).toBe(1200));
  it("waits 200ms before the new word audio", () => expect(GAME_TIMINGS.newWordAudioDelay).toBe(200));
  it("skips to the next word in 250ms", () => expect(GAME_TIMINGS.skipTransition).toBe(250));
});
