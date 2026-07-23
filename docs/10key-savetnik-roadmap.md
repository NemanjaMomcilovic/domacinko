# 10KEY Savetnik — roadmap

Kratki plan za AI u Domaćinku / 10KEY ekosistemu.

## Opcija 1 — 10KEY Savetnik (default, uvek dostupan)

**Šta je:** Rule + context engine (`js/modules/ai-providers/local-rules.js`) — besplatno, radi odmah, offline.

- Prepoznaje 25+ namera (budžet, današnji troškovi, kuvanje, kupovina, održavanje, štednja, računi…)
- Odgovori iz **stvarnih** podataka korisnika (localStorage / sinhronizacija)
- Proaktivni welcome, brzi chipovi, akcije (dodaj na listu, otvori modul)
- **Shipuje se** u svakom buildu — GitHub Pages, PWA, Capacitor APK
- **Fallback** ako Ollama/OpenAI nisu dostupni

Ovo je **primarni proizvod** za beta i sve korisnike.

## Opcija 2 — OpenAI (opciono)

Korisnik izabere provider **OpenAI** i unese API ključ u Više → Napredno → Napredni režim.

- Plaća OpenAI direktno
- GPT-4o streaming kada je ključ aktivan (`js/modules/ai-providers/openai.js`)
- Fallback na 10KEY lokalni ako mreža/ključ ne rade

Nije obavezno za korišćenje aplikacije.

## Opcija 3 — Lokalni open-source (Ollama) — v7.7.0+

**Cilj:** Pametniji odgovori **bez** OpenAI pretplate, na mašini sa dovoljno VRAM/RAM.

**Šta radi sada (ovaj repo):**

- Provider **Ollama** u Više → 10KEY Savetnik
- Host (default `http://127.0.0.1:11434`) + model (default `qwen2.5:7b`)
- Streaming NDJSON preko `/api/chat`
- Isti kućni kontekst kao GPT putanja (`prompt.js`)
- Test veze → `/api/tags`
- Uputstvo: [ollama-setup.md](ollama-setup.md)

| Pristup | PWA (GitHub Pages) | APK / desktop |
|--------|-------------------|---------------|
| Ollama na **istom** PC-u | ✅ uz `OLLAMA_ORIGINS` | ✅ |
| Ollama na tuđem telefonu / udaljeno | ❌ localhost | ❌ bez companion |
| Bundled model u companion | — | 🔜 poseban projekat |
| On-device u APK (llama.cpp, MLC) | ❌ | 🔜 veći APK |

**Ograničenje:** Telefoni i prijatelji **ne mogu** koristiti Ollamu na vašem PC-u preko GitHub Pages. Za sve korisnike koji preuzmu app — i dalje Opcija 1; Opcija 3 je opt-in za developere / PC sa Ollamom.

**Sledeći koraci:**

1. Zadržati Opciju 1 kao default u svim kanalima ✅
2. Companion / poseban prozor (`10key-savetnik-local`) za lakši setup
3. APK: LAN tunel ka companion **ili** mali ugrađeni model
4. Hardver: 16GB+ VRAM pogodan za 7B–14B (npr. RTX 5070 Ti)

Referentna mašina: RTX 5070 Ti 16GB, 32GB RAM — Qwen2.5 7B/14B.

## Provider arhitektura (v7.7.0)

```
settings.aiProvider → registry.js
  ├─ local   → local-rules.js
  ├─ ollama  → ollama.js  (+ fallback local)
  └─ openai  → openai.js  (+ fallback local)
```

## Verzije

| Verzija | Fokus |
|---------|--------|
| v7.7.0 | Opcija 3 foundation — Ollama provider, settings, docs |
| v7.2.1 | Rebrand na 10KEY Savetnik, jači lokalni engine |
| v7.1.x | Više namera, bolji kontekst, beta feedback |
| v8+ | Companion / on-device model za telefone |

---

*10KEY · Domaćinko — pametni alati za svakodnevni život.*
