# Domaćinko — Android APK (Capacitor)

Ovaj vodič objašnjava kako da napravite Android APK od Domaćinko PWA aplikacije koristeći **Capacitor**. APK se gradi na vašem računaru pomoću **Android Studio**.

> **Napomena:** Sam build APK-a zahteva Android Studio i JDK — pripremili smo sve konfiguracije; vi pokrećete build lokalno.

---

## Preduslovi

1. **Node.js** 18+ — [nodejs.org](https://nodejs.org/)
2. **Android Studio** (najnovija stabilna) — [developer.android.com/studio](https://developer.android.com/studio)
3. **JDK 17** — obično dolazi sa Android Studio
4. Git repozitorijum Domaćinko kloniran na disk

---

## Korak 1 — Instalacija zavisnosti

Otvorite PowerShell u folderu projekta:

```powershell
cd C:\Users\pc\10KEY\domacinko
npm install
```

---

## Korak 2 — Dodavanje Android platforme

Prvi put pokrenite:

```powershell
npx cap add android
```

Ako `android/` folder već postoji, preskočite ovaj korak.

---

## Korak 3 — Sinhronizacija web aplikacije

Posle svake izmene HTML/CSS/JS fajlova:

```powershell
npx cap sync android
```

Ili koristite npm skriptu:

```powershell
npm run cap:sync
```

Ovo kopira web fajlove u Android projekat i ažurira native zavisnosti.

---

## Korak 4 — Ikone aplikacije

Ikone se generišu iz `assets/icons/`:

| Fajl | Namena |
|------|--------|
| `icon-192.svg` / `icon-192.png` | Launcher ikona |
| `icon-512.svg` / `icon-512.png` | Splash / store |

Za automatsko generisanje svih Android rezolucija (opciono):

```powershell
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

Ručno: u Android Studio → **File → New → Image Asset** → izaberite `assets/icons/icon-512.png`.

---

## Korak 5 — Otvaranje u Android Studio

```powershell
npx cap open android
```

Ili: **npm run cap:open**

Android Studio će učitati projekat iz `android/` foldera.

---

## Korak 6 — Build APK

U Android Studio:

1. Sačekajte da se završi Gradle sync
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. APK se nalazi u: `android/app/build/outputs/apk/debug/app-debug.apk`

Za **release** APK (potpisivanje):

1. **Build → Generate Signed Bundle / APK**
2. Kreirajte ili izaberite keystore
3. Izaberite **APK** → **release**

---

## Korak 7 — Testiranje na uređaju

1. Uključite **Developer options** i **USB debugging** na Android telefonu
2. Povežite USB kablom
3. U Android Studio: **Run ▶** (zeleno dugme)

---

## Konfiguracija

| Parametar | Vrednost |
|-----------|----------|
| App ID | `com.tenkey.domacinko` |
| App Name | `Domacinko` |
| Web dir | `.` (ceo projekat) |
| Android scheme | `https` |

Konfiguracija je u `capacitor.config.ts`.

---

## Supabase i mreža

Aplikacija koristi Supabase preko HTTPS. Proverite da `AndroidManifest.xml` dozvoljava internet:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Capacitor to dodaje automatski.

Za **deep link** na auth callback, dodajte u `AndroidManifest.xml` intent-filter za vaš domen (GitHub Pages URL) — opciono za produkciju.

---

## Rešavanje problema

| Problem | Rešenje |
|---------|---------|
| Gradle sync failed | Proverite JDK 17 u Android Studio → Settings → Build Tools |
| Beli ekran | Pokrenite `npx cap sync` ponovo; proverite `webDir` u config |
| Supabase ne radi | Unesite ključeve u Podešavanjima aplikacije na uređaju |
| APK prevelik | Normalno za debug (~15–25 MB); release je manji |

---

## Korisne komande

```powershell
npm run cap:sync    # Sinhronizuj web → Android
npm run cap:open    # Otvori Android Studio
npm run cap:copy    # Samo kopiraj web fajlove
```

---

**Domaćinko v7.0.0** — Powered by [10KEY](https://github.com/NemanjaMomcilovic/domacinko)
