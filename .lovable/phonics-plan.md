# Phonics Board — plan for next session

## What the child sees
- New "Phonics" section reachable from the home screen (its own page).
- A chessboard-style grid of tiles (alternating warm-paper colors), grouped: Letter sounds (a–z), Digraphs (sh, ch, th, wh, ph, ck, ng), Long vowels (ai, ee, igh, oa, oo, ar, or, er, ow, oi, ur), Blends (bl, cr, st, …).
- Tap a tile: it grows and lifts to the centre with its sound, a sample word + picture (e.g. "sh — ship"), and plays the sound, then the word.
- Female/Male toggle at the top; "Play again" button on the enlarged tile; tap outside to close.

## Audio (prerecorded, no waiting)
- Generate ahead of time with the same studio Indian voices (Neerja / Prabhat) using SSML phoneme tags so the true sound ("/sss/", not "ess") is spoken, plus the sample word.
- Store under the app's audio folder per voice: phonics/{id}.mp3 and phonics/{id}-word.mp3 (~44 sounds x 2 x 2 voices ≈ 3 MB).
- Fall back to the device voice saying the sample word if a file fails.

## Build steps
1. Phonics data list (id, display, IPA, sample word, group).
2. Batch script to record the audio; listen-check a few.
3. Phonics page + grid + enlarge animation + voice toggle.
4. Home-screen link, page title/description, mobile check (large tiles).
