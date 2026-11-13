import { STAGE_WORDS, type WordEntry } from "@/data/words";

const EXTRA_FAMOUS_ANIMALS = [
  "elephant",
  "snake",
  "crocodile",
  "gorilla",
  "kangaroo",
  "cheetah",
  "flamingo",
  "raccoon",
  "rhinoceros",
  "hippopotamus",
] as const;

export const FAMOUS_ANIMAL_WORDS: WordEntry[] = [
  ...STAGE_WORDS[6],
  ...EXTRA_FAMOUS_ANIMALS.map((word) => ({
    id: word,
    word,
    stage: 6 as const,
    category: "animals",
    image: `/words/${word}.svg`,
  })),
];