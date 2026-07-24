# Ollama setup — 10KEY Savetnik (Opcija 3)

Lokalni open-source model preko [Ollama](https://ollama.com) na vašem računaru. Domaćinko šalje chat zahteve na `http://127.0.0.1:11434` (ili host koji unesete u podešavanjima).

## Brzi start (Windows)

1. Instalirajte Ollama: https://ollama.com/download
2. Otvorite PowerShell / terminal i povucite model:

```powershell
ollama pull qwen2.5:7b
```

Alternativa (slična veličina): `ollama pull llama3.1:8b`

3. Proverite da radi:

```powershell
ollama list
ollama run qwen2.5:7b "Zdravo, odgovori kratko na srpskom."
```

4. U Domaćinku: **Više → 10KEY Savetnik → Provider = Ollama**
   - Host: `http://127.0.0.1:11434`
   - Model: `qwen2.5:7b`
   - Dugme **Testiraj vezu** (zove `/api/tags`)
5. Sačuvajte podešavanja i otvorite Savetnik.

## Preporučeni modeli (RTX 16GB VRAM / 32GB RAM)

| Model | VRAM (približno) | Napomena |
|-------|------------------|----------|
| `qwen2.5:7b` | ~6–8 GB | **Preporučeno** — dobar srpski / brzina |
| `qwen2.5:14b` | ~10–12 GB | Bolji kvalitet, sporije |
| `llama3.1:8b` | ~6–8 GB | Dobra alternativa |

## CORS (GitHub Pages / web)

Browser sa hostovane PWA (npr. GitHub Pages) zove Ollamu na **vašem** `localhost`. Ollama mora dozvoliti origin:

```powershell
# Privremeno (trenutna sesija)
$env:OLLAMA_ORIGINS="*"
# zatim restartujte Ollama aplikaciju / servis
```

Trajno (Windows): System Properties → Environment Variables → User:
- Ime: `OLLAMA_ORIGINS`
- Vrednost: `*` (ili konkretan origin, npr. `https://vas-user.github.io`)

Bez ovoga `fetch` iz browsera može pasti zbog CORS.

## Ograničenja

| Scenarijo | Radi? |
|-----------|-------|
| PWA na **istom PC** gde je Ollama | ✅ uz CORS |
| GitHub Pages na **vašem** PC-u | ✅ uz CORS + Ollama pokrenuta |
| Telefon prijatelja → **vaš** PC Ollama | ❌ (nema pristupa vašem localhost) |
| Telefon + Ollama na telefonu | ❌ trenutno (kasnije companion/APK) |
| Offline bez Ollame | ✅ fallback na **10KEY lokalni** intent engine |

**Bitno:** Ollama mora biti pokrenuta na uređaju koji otvara app. Za telefone — kasnije companion app ili ugrađeni model u APK (vidi roadmap).

## Capacitor / APK (putanja, još nije u ovom izdanju)

- WebView na Androidu može da zove `http://10.0.2.2:11434` (emulator → host PC) ili LAN IP companion servera.
- Dugoročno: poseban **10KEY companion** (desktop) ili on-device model (llama.cpp / MLC) — veći APK.
- Ovaj release samo dokumentuje putanju; ne bundluje model u APK.

## Arhitektura u repou

```
js/modules/ai-providers/
  local-rules.js   ← default / fallback
  ollama.js        ← /api/chat stream (NDJSON)
  openai.js        ← GPT-4o (opciono)
  registry.js      ← bira providera iz settings.aiProvider
  prompt.js        ← isti kućni kontekst za LLM
```

Podešavanja: `settings.aiProvider` = `local` | `ollama` | `openai`.

---

*10KEY · Domaćinko v7.8.0*
