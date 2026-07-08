/**
 * Domaćinko — Supabase konfiguracija (primer za fork / lokalni razvoj)
 * Kopirajte ovaj fajl kao config.js i unesite svoje vrednosti.
 * config.js je u .gitignore i neće biti poslat na GitHub.
 *
 * Alternativa (GitHub Pages / telefon): Podešavanja → Poveži nalog (Supabase)
 * — ključevi se čuvaju u localStorage (domacinko_supabase_config) na uređaju.
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
