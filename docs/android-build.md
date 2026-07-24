# Domaćinko — Android APK (Capacitor)

Ovaj vodič objašnjava kako da napravite Android APK od Domaćinko PWA aplikacije koristeći **Capacitor**. APK se gradi na **Windowsu** pomoću **Android Studio**.

> **Napomena:** CI/agent okruženje često **nema** Android SDK — zato `npm run cap:sync` radi svuda, a sam APK build mora lokalno u Android Studio.

---

## Preduslovi (Windows)

| Alat | Verzija | Instalacija |
|------|---------|-------------|
| **Node.js** | 18+ (preporuka 20 LTS) | [nodejs.org](https://nodejs.org/) |
| **JDK** | **17** | Dolazi sa Android Studio, ili [Adoptium Temurin 17](https://adoptium.net/) |
| **Android Studio** | najnovija stabilna | [developer.android.com/studio](https://developer.android.com/studio) |
| **Android SDK** | API 34+ (Studio wizard) | Android Studio → Settings → Android SDK |

Pri prvoj instalaciji Android Studio:
1. Izaberite tipičnu instalaciju (SDK + Platform Tools)
2. Settings → **Build, Execution, Deployment → Build Tools → Gradle** → Gradle JDK = **17**
3. Settings → **Android SDK** → instalirajte **Android SDK Platform 34** i **Build-Tools**

Provera u PowerShell:

```powershell
node -v
java -version   # treba 17.x
# Opciono:
echo $env:ANDROID_HOME
# Tipična putanja: %LOCALAPPDATA%\Android\Sdk
```

Ako `npm install` padne na SSL (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`):

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm install
```

---

## Brzi put (PowerShell)

```powershell
cd C:\Users\pc\10KEY\domacinko

# 1) Zavisnosti
npm install

# 2) Prvi put — Android platforma (kreira android/)
npm run cap:add
# ili: npx cap add android   (posle npm run prepare:www)

# 3) Sinhronizacija web → native (posle svake izmene HTML/CSS/JS)
npm run cap:sync

# 4) Otvori Android Studio
npm run cap:open

# Ili sve do sync + podsetnik za build:
npm run build:android
```

---

## Šta radi `cap:sync`

1. **`npm run prepare:www`** — kopira samo PWA fajlove u `www/`  
   (`index.html`, `pages/`, `css/`, `js/`, `assets/`, `manifest.json`, `sw.js`, `config.js`, …)  
   **Ne** kopira `node_modules/`, `docs/`, `android/`, skripte.
2. **`npx cap sync android`** — ubacuje `www/` u Android projekat i ažurira native zavisnosti.

Konfiguracija: `capacitor.config.ts`

| Parametar | Vrednost |
|-----------|----------|
| App ID | `com.tenkey.domacinko` |
| App Name | `Domacinko` |
| Web dir | `www` (generiše se skriptom) |
| Android scheme | `https` |
| Brand boja | `#2d8f5c` (10KEY green) |

> **Važno:** Izvorni web PWA (GitHub Pages / `python -m http.server`) ostaje netaknut — `www/` je samo staging za Capacitor i nije u gitu.

---

## Build APK u Android Studio

1. Sačekajte da se završi **Gradle sync**
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Debug APK:

```text
android\app\build\outputs\apk\debug\app-debug.apk
```

### Release (potpisani) APK

1. **Build → Generate Signed Bundle / APK**
2. Kreirajte ili izaberite keystore (čuvajte ga bezbedno)
3. Izaberite **APK** → **release**

### CLI (ako je SDK instaliran)

```powershell
cd C:\Users\pc\10KEY\domacinko
npm run cap:sync
.\android\gradlew.bat -p android assembleDebug
# APK: android\app\build\outputs\apk\debug\app-debug.apk
```

Bez Android SDK / JDK 17 ova komanda **neće** uspeti — to je očekivano; koristite Android Studio.

---

## Ikone (10KEY / Domaćinko)

Izvori u repou:

| Fajl | Namena |
|------|--------|
| `assets/icons/icon-192.png` / `.svg` | Launcher / PWA |
| `assets/icons/icon-512.png` / `.svg` | Store / splash |
| `assets/logos/domacinko.png` | Brand logo |
| `assets/logos/10key.png` | 10KEY brand |

Automatsko generisanje Android mipmap ikona (opciono):

```powershell
npm install -D @capacitor/assets
npx capacitor-assets generate --android --iconBackgroundColor '#2d8f5c' --iconBackgroundColorDark '#1a5c3a'
```

Ručno: Android Studio → **File → New → Image Asset** → izvor `assets/icons/icon-512.png` ili `assets/logos/domacinko.png`.

---

## Testiranje na telefonu

1. Uključite **Developer options** i **USB debugging**
2. USB kabl → Android Studio → **Run ▶**
3. Ili kopirajte `app-debug.apk` na telefon i instalirajte (dozvolite „nepoznati izvori“)

---

## Ograničenja na telefonu (važno)

| Tema | Šta očekivati |
|------|----------------|
| **Ollama / localhost** | Telefon **ne može** da dosegne `localhost:11434` na vašem PC-u. Treba companion (proxy na LAN IP), tailscale/VPN, ili cloud provider. Vidite `docs/ollama-setup.md`. |
| **Supabase OAuth** | Redirect URL na native je `https://localhost/...` (Capacitor `androidScheme`). Dodajte taj URL u Supabase Auth → Redirect URLs. Za produkciju: HTTPS deep link + intent-filter na vaš GitHub Pages domen. |
| **Service Worker** | U WebView-u se ponaša drugačije nego u Chrome PWA; offline keš može biti ograničen — lokalni podaci i dalje rade preko `localStorage`. |
| **`android/` folder** | Generiše se lokalno (`npm run cap:add`). **Nije u gitu** — svaki developer ga kreira kod sebe. |
| **Internet** | `INTERNET` permission Capacitor dodaje automatski. |

### Primer intent-filter (opciono, produkcija)

U `android/app/src/main/AndroidManifest.xml` unutar `<activity>` (posle postojećeg launcher filtera), za GitHub Pages domen:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https"
          android:host="YOUR_USER.github.io"
          android:pathPrefix="/domacinko" />
</intent-filter>
```

Zatim isti URL dodajte u Supabase Redirect URLs.

---

## npm skripte

```powershell
npm run prepare:www   # Samo popuni www/
npm run cap:add       # Prvi put: www + cap add android
npm run cap:sync      # www + sync (najčešće)
npm run cap:copy      # www + copy (bez update native deps)
npm run cap:open      # Otvori Android Studio
npm run build:android # sync + podsetnik za Studio build
```

---

## Rešavanje problema

| Problem | Rešenje |
|---------|---------|
| Gradle sync failed | JDK **17** u Android Studio → Settings → Build Tools → Gradle |
| Beli ekran | `npm run cap:sync`; proverite da `www/` nije prazan |
| `webDir` greška | Mora postojati `www/` — pokrenite `npm run prepare:www` |
| Supabase ne radi | Ključevi u Podešavanjima; HTTPS; Redirect URLs |
| Ollama ne radi na telefonu | Očekivano bez companion-a / LAN IP |
| APK prevelik | Debug ~15–25 MB; release manji |
| npm SSL greška | `$env:NODE_OPTIONS='--use-system-ca'` |

---

## Checklist pre release APK-a

- [ ] `npm run cap:sync` bez greške
- [ ] Ikone zamenjene (ne default Capacitor)
- [ ] Supabase redirect URLs za native / HTTPS
- [ ] Test na fizičkom uređaju (auth, troškovi, offline)
- [ ] Potpisan release APK (keystore sačuvan)

---

**Domaćinko v7.8.0** — Powered by [10KEY](https://github.com/NemanjaMomcilovic/domacinko)
