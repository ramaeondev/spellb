// Proprietary media (word pictures, voice clips) is served from Cloudflare R2 at cdn.therama.dev.
// Set VITE_ASSET_BASE="" to load the local public/ copies instead.
const BASE = (import.meta.env["VITE_ASSET_BASE"] ?? "https://cdn.therama.dev/spellb").replace(
  /\/$/,
  "",
);

export const asset = (path: string) => `${BASE}${path}`;
