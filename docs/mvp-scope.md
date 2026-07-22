# Domaćinko — MVP obim (v7.5.0)

Ovaj dokument definiše šta aplikacija **radi sada** (Core v1) i šta je **odloženo** za kasnije verzije (v2+). Kod v2 modula ostaje u repou — sakriven je u beta režimu (`settings.betaMode: true`, podrazumevano).

## Core v1 — šta se isporučuje sada

| Modul | Stranica | Status |
|-------|----------|--------|
| **Početna + brifing** | `home.html` | ✅ Realni podaci — bez demo sadržaja |
| **Troškovi** | `finances.html`, `add-expense.html` | ✅ Dodavanje, lista, mesečni pregled |
| **Komunalije** | `utility-bills.html` | ✅ Tipovi računa, mesečni unos, foto + potvrda, plaćeno |
| **Plan obroka** | `meal-plan.html` | ✅ 3 obroka/dan (doručak, ručak, večera), gotovo jelo ili namirnice, 70+ srpskih jela |
| **Lista kupovine** | `shopping.html` | ✅ Dodavanje, označavanje kupljenog |
| **10KEY Savetnik** | `ai.html` | ✅ Lokalni, besplatan — budžet, obroci, kupovina |
| **Nalog** | `auth.html` | ✅ Prijava, odjava, sinhronizacija |
| **Profil** | `profile.html` | ✅ Ime, budžet, domaćinstvo |
| **Porodica** | `household-share.html` | ✅ Pozivni kod (ako je Supabase podešen) |
| **Feedback** | `feedback.html` | ✅ Beta ocena i komentar |
| **Podešavanja** | `settings.html` | ✅ Pojednostavljen „Više" tab |

### Šta korisnik vidi u v1 (beta režim)

- **4 taba** u donjoj navigaciji: Početna · Troškovi · Obroci · Više
- **Brze akcije** na početnoj: trošak, komunalije, plan obroka, Savetnik, kupovina
- **Uvod (3 koraka)**: ime → budžet → prvi trošak — pominje samo osnovne funkcije
- **Više → Alati za dom** (`modules.html`): core moduli označeni „Aktivno", v2 „Dolazi uskoro"
- **Napredno → Prikaži sve module**: isključuje beta režim za power korisnike

### Tri rečenice — šta app radi

1. Prati troškove, budžet i komunalije
2. Planira obroke i listu za kupovinu
3. Savetuje preko 10KEY Savetnika (besplatno, offline)

### Komunalije — v1 vs kasnije

| Sada (v1) | Kasnije |
|-----------|---------|
| Tipovi: struja, voda, grejanje, internet, stanarina, drugo | Više tipova / brojila |
| Recurrence: pitaj / auto / off | Pametniji rokovi |
| Foto + ručni iznos + potvrda pre čuvanja | Bolji lokalni OCR / cloud Vision |
| Brifing: „Da li si dobio račun…?" / neplaćeno | Push notifikacije |
| Kompresovana foto u localStorage | Cloud arhiva računa |

OCR pipeline je zamenljiv (`js/modules/bills/`) — UI uvek traži potvrdu. Store OCR (fiskalni računi) ostaje v2 (`scan-receipt.html`).

---

## v2+ — odloženo (kod postoji, sakriven u beta)

| Modul | Stranica | Napomena |
|-------|----------|----------|
| Održavanje | `maintenance.html` | Servisi, sezonski poslovi |
| Inventar | `inventory.html` | Garancije, magacin |
| Bašta | `garden.html` | Biljke, zalivanje |
| Dnevnik kuće | `diary.html` | Istorija radova |
| Projekti | `projects.html` | DIY, materijal |
| Majstori | `craftsmen.html` | Orijentacione cene |
| Sezonski plan | `seasonal.html` | Mesečna checklista |
| AI Majstor | `repairs.html` | DIY popravke |
| Vizuelni asistent | `visual-assist.html` | Analiza fotografija |
| Baza znanja | `knowledge.html` | Sačuvana rešenja |
| Prognoza troškova | `forecast.html` | Kalendar rashoda |
| Skeniranje računa (prodavnica) | `scan-receipt.html` | Store OCR |
| Cloud / napredni OCR komunalija | `parsers/cloud-vision.js` | Isti ScanResult ugovor |
| Profil kuće | `house-profile.html` | m², grejanje |
| Alati | `tools.html` | Inventar alata |
| Bezbednost | `safety.html` | Detektori, lekovi |
| Domaćinstvo (pun) | `household.html` | Ostava, auti, računi |
| Gamifikacija | — | Titule, badge-ovi (delimično u health score) |
| Glasovni režim | `voice.js` | Web Speech API |
| Napredna kupovina | `shopping.html` sekcije | Praćenje cena, ostava |

### Kako uključiti v2 module

**Više → Napredno → Prikaži sve module** — isključuje `betaMode` i prikazuje punu navigaciju (6 tabova + svi moduli na početnoj).

---

## Tehnički detalji

- **Konfiguracija**: `js/mvp-config.js` — lista core/v2 modula i helper funkcije
- **Beta provera**: `isBetaMode()` u `js/storage.js` (`settings.betaMode !== false`)
- **Navigacija**: `js/navigation.js` — `NAV_ITEMS_BETA` vs `NAV_ITEMS_FULL`
- **Moduli hub**: `js/pages/modules.js` — dinamički render iz `MVP_MODULE_SECTIONS`
- **Komunalije OCR**: `js/modules/bills/` — `bill-scanner.js` + registry (local → cloud)

## Verzionisanje

- **v7.5.0** — Komunalije (core): tipovi, recurrence, foto potvrda, brifing
- **v7.4.0** — Plan obroka: 3 obroka/dan, gotovo jelo ili namirnice, proširen katalog
- **v7.3.0** — MVP focus: dokumentacija, beta enforcement, polish core tokova
- v2 moduli se uvode postepeno u v7.6+, v8.0+ prema [roadmap.md](roadmap.md)
