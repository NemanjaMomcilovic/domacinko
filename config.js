/**
 * Domaćinko — javna Supabase konfiguracija (GitHub Pages)
 *
 * Ovaj fajl je namerno u repozitorijumu: anon/publishable ključ je bezbedan
 * za statičke SPA aplikacije — RLS u Supabase štiti podatke.
 *
 * NIKADA ne commitujte service_role tajni ključ. Za dodatne tajne koristite
 * config.secret.js (u .gitignore).
 *
 * Prioritet: važeći config.js → localStorage (Podešavanja) → gost režim.
 */
window.DOMACINKO_CONFIG = {
  SUPABASE_URL: 'https://rymphibbelkzdxchhfsm.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_S1XpiibKFcadugcShiWgMQ_M3GclzDQ',
  CONTACT_EMAIL: 'feedback@10key.app'
};
