export type PhonicsGroup = "letters" | "digraphs" | "vowels" | "blends";

export interface PhonicsEntry {
  id: string;
  display: string;
  /** Kid-friendly spelling of the pure sound, e.g. "sss" — not the letter name. */
  sound: string;
  /** Short human-readable phonetic hint, e.g. "/sh/". */
  ipa: string;
  word: string;
  image: string;
  group: PhonicsGroup;
}

export const PHONICS_GROUP_ORDER: PhonicsGroup[] = ["letters", "digraphs", "vowels", "blends"];

export const PHONICS_GROUP_LABELS: Record<PhonicsGroup, string> = {
  letters: "Letter sounds",
  digraphs: "Digraphs",
  vowels: "Long vowels",
  blends: "Blends",
};

export const PHONICS: PhonicsEntry[] = [
  { id: "a", display: "a", sound: "aah", ipa: "/ae/", word: "apple", image: `/words/apple.svg`, group: "letters" },
  { id: "b", display: "b", sound: "buh", ipa: "/b/", word: "ball", image: `/words/ball.svg`, group: "letters" },
  { id: "c", display: "c", sound: "kuh", ipa: "/k/", word: "cat", image: `/words/cat.svg`, group: "letters" },
  { id: "d", display: "d", sound: "duh", ipa: "/d/", word: "dog", image: `/words/dog.svg`, group: "letters" },
  { id: "e", display: "e", sound: "eh", ipa: "/e/", word: "egg", image: `/words/egg.svg`, group: "letters" },
  { id: "f", display: "f", sound: "fff", ipa: "/f/", word: "fish", image: `/words/fish.svg`, group: "letters" },
  { id: "g", display: "g", sound: "guh", ipa: "/g/", word: "goat", image: `/words/goat.svg`, group: "letters" },
  { id: "h", display: "h", sound: "huh", ipa: "/h/", word: "hat", image: `/words/hat.svg`, group: "letters" },
  { id: "i", display: "i", sound: "ih", ipa: "/i/", word: "ink", image: `/words/ink.svg`, group: "letters" },
  { id: "j", display: "j", sound: "juh", ipa: "/j/", word: "jam", image: `/words/jam.svg`, group: "letters" },
  { id: "k", display: "k", sound: "kuh", ipa: "/k/", word: "kite", image: `/words/kite.svg`, group: "letters" },
  { id: "l", display: "l", sound: "luh", ipa: "/l/", word: "lion", image: `/words/lion.svg`, group: "letters" },
  { id: "m", display: "m", sound: "mmm", ipa: "/m/", word: "moon", image: `/words/moon.svg`, group: "letters" },
  { id: "n", display: "n", sound: "nnn", ipa: "/n/", word: "nut", image: `/words/nut.svg`, group: "letters" },
  { id: "o", display: "o", sound: "aw", ipa: "/o/", word: "octopus", image: `/words/octopus.svg`, group: "letters" },
  { id: "p", display: "p", sound: "puh", ipa: "/p/", word: "pig", image: `/words/pig.svg`, group: "letters" },
  { id: "q", display: "q", sound: "kwuh", ipa: "/kw/", word: "quilt", image: `/words/quilt.png`, group: "letters" },
  { id: "r", display: "r", sound: "ruh", ipa: "/r/", word: "rat", image: `/words/rat.svg`, group: "letters" },
  { id: "s", display: "s", sound: "sss", ipa: "/s/", word: "sun", image: `/words/sun.svg`, group: "letters" },
  { id: "t", display: "t", sound: "tuh", ipa: "/t/", word: "top", image: `/words/top.svg`, group: "letters" },
  { id: "u", display: "u", sound: "uh", ipa: "/u/", word: "cup", image: `/words/cup.svg`, group: "letters" },
  { id: "v", display: "v", sound: "vvv", ipa: "/v/", word: "van", image: `/words/van.svg`, group: "letters" },
  { id: "w", display: "w", sound: "wuh", ipa: "/w/", word: "web", image: `/words/web.svg`, group: "letters" },
  { id: "x", display: "x", sound: "kss", ipa: "/ks/", word: "box", image: `/words/box.svg`, group: "letters" },
  { id: "y", display: "y", sound: "yuh", ipa: "/y/", word: "yak", image: `/words/yak.svg`, group: "letters" },
  { id: "z", display: "z", sound: "zzz", ipa: "/z/", word: "zip", image: `/words/zip.svg`, group: "letters" },
  { id: "sh", display: "sh", sound: "shh", ipa: "/sh/", word: "shoe", image: `/words/shoe.svg`, group: "digraphs" },
  { id: "ch", display: "ch", sound: "chuh", ipa: "/ch/", word: "chair", image: `/words/chair.svg`, group: "digraphs" },
  { id: "th", display: "th", sound: "thuh", ipa: "/th/", word: "bath", image: `/words/bath.svg`, group: "digraphs" },
  { id: "wh", display: "wh", sound: "wuh", ipa: "/w/", word: "whale", image: `/words/whale.svg`, group: "digraphs" },
  { id: "ph", display: "ph", sound: "fff", ipa: "/f/", word: "dolphin", image: `/words/dolphin.svg`, group: "digraphs" },
  { id: "ck", display: "ck", sound: "kuh", ipa: "/k/", word: "duck", image: `/words/duck.svg`, group: "digraphs" },
  { id: "ng", display: "ng", sound: "ngg", ipa: "/ng/", word: "king", image: `/words/king.svg`, group: "digraphs" },
  { id: "ai", display: "ai", sound: "ay", ipa: "/ay/", word: "rain", image: `/words/rain.svg`, group: "vowels" },
  { id: "ay", display: "ay", sound: "ay", ipa: "/ay/", word: "bay", image: `/words/bay.svg`, group: "vowels" },
  { id: "ee", display: "ee", sound: "ee", ipa: "/ee/", word: "bee", image: `/words/bee.svg`, group: "vowels" },
  { id: "igh", display: "igh", sound: "eye", ipa: "/ie/", word: "bright", image: `/words/bright.svg`, group: "vowels" },
  { id: "oa", display: "oa", sound: "oh", ipa: "/oa/", word: "boat", image: `/words/boat.svg`, group: "vowels" },
  { id: "oo", display: "oo", sound: "oo", ipa: "/oo/", word: "moon", image: `/words/moon.svg`, group: "vowels" },
  { id: "ar", display: "ar", sound: "ar", ipa: "/ar/", word: "star", image: `/words/star.svg`, group: "vowels" },
  { id: "or", display: "or", sound: "or", ipa: "/or/", word: "corn", image: `/words/corn.svg`, group: "vowels" },
  { id: "er", display: "er", sound: "ur", ipa: "/er/", word: "flower", image: `/words/flower.svg`, group: "vowels" },
  { id: "ir", display: "ir", sound: "ur", ipa: "/er/", word: "circle", image: `/words/circle.svg`, group: "vowels" },
  { id: "ow", display: "ow", sound: "ow", ipa: "/ow/", word: "cow", image: `/words/cow.svg`, group: "vowels" },
  { id: "oi", display: "oi", sound: "oy", ipa: "/oy/", word: "coin", image: `/words/coin.svg`, group: "vowels" },
  { id: "oy", display: "oy", sound: "oy", ipa: "/oy/", word: "toy", image: `/words/toy.svg`, group: "vowels" },
  { id: "ur", display: "ur", sound: "ur", ipa: "/er/", word: "turkey", image: `/words/turkey.svg`, group: "vowels" },
  { id: "bl", display: "bl", sound: "bluh", ipa: "/bl/", word: "block", image: `/words/block.svg`, group: "blends" },
  { id: "br", display: "br", sound: "bruh", ipa: "/br/", word: "bread", image: `/words/bread.svg`, group: "blends" },
  { id: "cl", display: "cl", sound: "cluh", ipa: "/cl/", word: "cloud", image: `/words/cloud.svg`, group: "blends" },
  { id: "cr", display: "cr", sound: "cruh", ipa: "/cr/", word: "crab", image: `/words/crab.svg`, group: "blends" },
  { id: "dr", display: "dr", sound: "druh", ipa: "/dr/", word: "dragon", image: `/words/dragon.svg`, group: "blends" },
  { id: "fl", display: "fl", sound: "fluh", ipa: "/fl/", word: "flower", image: `/words/flower.svg`, group: "blends" },
  { id: "fr", display: "fr", sound: "fruh", ipa: "/fr/", word: "frog", image: `/words/frog.svg`, group: "blends" },
  { id: "gl", display: "gl", sound: "gluh", ipa: "/gl/", word: "glass", image: `/words/glass.svg`, group: "blends" },
  { id: "gr", display: "gr", sound: "gruh", ipa: "/gr/", word: "grape", image: `/words/grape.svg`, group: "blends" },
  { id: "pl", display: "pl", sound: "pluh", ipa: "/pl/", word: "plant", image: `/words/plant.svg`, group: "blends" },
  { id: "pr", display: "pr", sound: "pruh", ipa: "/pr/", word: "prize", image: `/words/prize.png`, group: "blends" },
  { id: "sc", display: "sc", sound: "skuh", ipa: "/sc/", word: "scarf", image: `/words/scarf.png`, group: "blends" },
  { id: "sk", display: "sk", sound: "skuh", ipa: "/sk/", word: "sky", image: `/words/sky.svg`, group: "blends" },
  { id: "sl", display: "sl", sound: "sluh", ipa: "/sl/", word: "slide", image: `/words/slide.png`, group: "blends" },
  { id: "sm", display: "sm", sound: "smuh", ipa: "/sm/", word: "smile", image: `/words/smile.svg`, group: "blends" },
  { id: "sn", display: "sn", sound: "snuh", ipa: "/sn/", word: "snow", image: `/words/snow.svg`, group: "blends" },
  { id: "sp", display: "sp", sound: "spuh", ipa: "/sp/", word: "spider", image: `/words/spider.svg`, group: "blends" },
  { id: "st", display: "st", sound: "stuh", ipa: "/st/", word: "star", image: `/words/star.svg`, group: "blends" },
  { id: "sw", display: "sw", sound: "swuh", ipa: "/sw/", word: "swan", image: `/words/swan.svg`, group: "blends" },
  { id: "tr", display: "tr", sound: "truh", ipa: "/tr/", word: "train", image: `/words/train.svg`, group: "blends" },
  { id: "tw", display: "tw", sound: "twuh", ipa: "/tw/", word: "two", image: `/words/two.svg`, group: "blends" },
];
