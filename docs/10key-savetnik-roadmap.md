# 10KEY Savetnik — roadmap

Kratki plan za AI u Domaćinku / 10KEY ekosistemu.

## Opcija 1 — 10KEY Savetnik (trenutno, v7.1.1+)

**Šta je:** Rule + context engine u PWA/APK — besplatno, radi odmah, offline (v7.2.1+).

- Prepoznaje 25+ namera (budžet, današnji troškovi, kuvanje, kupovina, održavanje, štednja, računi…)
- Odgovori iz **stvarnih** podataka korisnika (localStorage / sinhronizacija)
- Proaktivni welcome, brzi chipovi, akcije (dodaj na listu, otvori modul)
- **Shipuje se** u svakom buildu — GitHub Pages, PWA, Capacitor APK

Ovo je **primarni proizvod** za beta i sve korisnike.

## Opcija 2 — OpenAI (opciono)

Korisnik unese svoj API ključ u Više → Napredno → Napredni režim.

- Plaća OpenAI direktno
- GPT-4o streaming kada je ključ aktivan
- Fallback na 10KEY Savetnik ako mreža/ključ ne rade

Nije obavezno za korišćenje aplikacije.

## Opcija 3 — Lokalni open-source model (budućnost)

**Cilj:** Svi koji preuzmu APK/PWA mogu pametnije odgovore **bez** OpenAI pretplate.

Mogući pristupi:

| Pristup | PWA (GitHub Pages) | APK / desktop |
|--------|-------------------|---------------|
| Ollama na PC-u + lokalni proxy | ❌ browser ne može `localhost` | ✅ companion ili ugrađeni server |
| Bundled mali model u desktop companion | ❌ | ✅ poseban 10KEY companion app |
| On-device model u APK (llama.cpp, MLC) | ❌ | ✅ moguće, veći APK |

**Ograničenje:** GitHub Pages hostovana verzija **ne može** zvati `localhost:11434` (Ollama) na korisnikovom računaru — CORS i bezbednost browsera.

**Plan:**

1. Zadržati Opciju 1 kao default u svim kanalima
2. Poseban projekat/prozor za Opciju 3 (npr. `10key-savetnik-local` ili desktop companion)
3. APK: embedded mali model **ili** tunel ka companion app na LAN-u
4. Dokumentovati hardverske preporuke (npr. 16GB+ VRAM za veće modele)

Referentna mašina developera: RTX 5070 Ti 16GB, 32GB RAM — dovoljno za lokalne modele u companion scenariju, ne utiče na Opciju 1 u produkciji.

## Verzije

| Verzija | Fokus |
|---------|--------|
| v7.2.1 | Rebrand na 10KEY Savetnik, jači lokalni engine |
| v7.1.x | Više namera, bolji kontekst, beta feedback |
| v8+ | Opcija 3 pilot (companion / Ollama) — odvojeni repo ili modul |

---

*10KEY · Domaćinko — pametni alati za svakodnevni život.*
