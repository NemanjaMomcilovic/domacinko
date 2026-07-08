/**
 * Domaćinko — Supabase konfiguracija (primer za fork)
 *
 * Za zvanični Domaćinko na GitHub Pages, config.js je već u repozitorijumu
 * sa anon/publishable ključem. Za sopstveni fork, kopirajte ovaj fajl:
 *
 *   copy config.example.js config.js
 *
 * Alternativa: Podešavanja → Poveži nalog (Supabase) — ključevi u localStorage.
 * Prioritet: važeći config.js → localStorage → gost režim.
 *
 * Podržani formati ključa:
 * - Legacy anon JWT: eyJhbGciOiJIUzI1NiIs...
 * - Novi publishable: sb_publishable_...
 */
window.DOMACINKO_CONFIG = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here'
};
