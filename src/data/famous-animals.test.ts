import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FAMOUS_ANIMAL_WORDS } from "@/data/famous-animals";

describe("Famous Animals stage", () => {
  it("contains exactly 100 unique animal words with clue images", () => {
    assert.equal(FAMOUS_ANIMAL_WORDS.length, 100);
    assert.equal(new Set(FAMOUS_ANIMAL_WORDS.map((entry) => entry.word)).size, 100);
    assert.ok(FAMOUS_ANIMAL_WORDS.every((entry) => entry.category === "animals" && entry.stage === 6 && entry.image.startsWith("/words/")));
  });
});