import { useEffect, useState } from "react";
import fallback from "@/data/social-links.json";

type SocialLink = { id: string; platform: string; url: string; display_name: string; sort_order?: number };

const ENDPOINT =
  "https://api-v3.therama.dev/rest/v1/social_links?select=id,platform,url,display_name,sort_order&is_active=eq.true&order=sort_order.asc";
const CACHE_KEY = "spellb-social-links-v1";

const FALLBACK: SocialLink[] = (fallback as SocialLink[]).map((item, index) => ({ ...item, sort_order: item.sort_order ?? index }));

// One request per browser session at most. No credentials are sent; if the API
// requires auth (401) or fails, the failure is cached and the bundled list is used.
async function loadLinks(): Promise<SocialLink[]> {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK;
    }
  } catch { /* ignore */ }
  let result: SocialLink[] = [];
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4000);
    const response = await fetch(ENDPOINT, { signal: controller.signal });
    window.clearTimeout(timer);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) result = data.filter((d) => d && typeof d.url === "string" && /^https:\/\//.test(d.url));
    }
  } catch { /* fall back */ }
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(result)); } catch { /* ignore */ }
  return result.length ? result : FALLBACK;
}

const ICONS: Record<string, string> = {
  github: "M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z",
  twitter: "M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-6.4L6.3 22H3.2l7.3-8.3L1 2h6.3l4.4 5.9L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z",
  linkedin: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  npm: "M0 7.33v8h6.67v1.34H12v-1.34h12v-8H0Zm6.67 6.67H5.33v-4H4v4H1.33V8.67h5.34V14Zm4 0v1.33H8V8.67h5.33V14h-2.66Zm12 0h-1.34v-4H20v4h-1.33v-4h-1.34v4h-2.66V8.67h8V14Zm-12-4h1.33v2.67h-1.33V10Z",
};

export function SocialLinks() {
  const [links, setLinks] = useState<SocialLink[]>(FALLBACK);
  useEffect(() => {
    let alive = true;
    loadLinks().then((next) => alive && setLinks(next));
    return () => { alive = false; };
  }, []);
  const sorted = [...links].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return (
    <ul className="flex items-center gap-1.5" aria-label="Developer links">
      {sorted.map((link) => (
        <li key={link.id}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.display_name} aria-label={link.display_name}
            className="grid size-9 place-items-center rounded-full text-ink/60 ring-1 ring-ink/10 transition hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d={ICONS[link.platform.toLowerCase()] ?? ICONS["github"]} /></svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
