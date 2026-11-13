<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture decisions

- Keep session uniqueness validation client-side with FingerprintJS and best-effort local session records because this game has no backend connection.
- Keep AI hint generation in a server-only TanStack function using the Lovable AI Gateway so the gateway secret and prompt policy never enter the browser.
- Load the on-device AI voices (@jtsage/piper-tts-web) only through a dynamic import inside playback, never at module top level, so SSR never evaluates the WASM bundle; typed letters always use the instant device voice so typing never waits on synthesis.
- Phonics tiles play pre-generated MP3 clips (pure sound then sample word) from `public/audio/{indian-female|indian-male}/phonics/{id}[-word].mp3` via `playPhonics` — never synthesize phonics sounds live; sounds listed in `OPEN_PHONICS` use open-licensed recordings from `public/audio/phonics-open/{id}.mp3` (shared by both voices) because human clips sound purer; the clip names are keyed by sound id, and `src/data/phonics.ts` mirrors the generation script's mapping.
- Keep the Famous Animals collection as a distinct 100-word stage derived from existing animal entries plus additional animals, so the original 500-word stage bank remains unchanged.
