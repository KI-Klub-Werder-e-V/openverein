# Mobile Apps (Android und iOS)

Die Apps verpacken denselben Web-Build mit [Capacitor](https://capacitorjs.com). Sie öffnen den eigenen OpenVerein-Server des Vereins. API, Anmeldung, Rechte und Funktionen sind also genau die der Web-App; einen eigenen nativen Codepfad gibt es nicht. Eine neue Web-Version kommt ohne Store-Update in den Apps an.

## Konfiguration

Variablen beim Bauen:

| Variable | Bedeutung | Beispiel | Gelesen von |
|---|---|---|---|
| `OPENVEREIN_URL` | Die OpenVerein-Adresse des Vereins, die die App öffnet | `https://verein.example.org` | `capacitor.config.ts` (von `cap sync` in beide Apps kopiert) |
| `OPENVEREIN_APP_ID` | Store-ID (eindeutig je veröffentlichter App) | `org.example.verein` | Android: `android/app/build.gradle` |
| `OPENVEREIN_APP_NAME` | Name unter dem App-Symbol | `SV Lindenhof` | Android: `android/app/build.gradle` |

Unter iOS stehen Bundle-ID und Anzeigename im Xcode-Projekt: Setze `PRODUCT_BUNDLE_IDENTIFIER` und den Anzeigenamen in Xcode (Target App → General) und dieselbe Bundle-ID unter `ios_signing.bundle_identifier` in `codemagic.yaml`.

Ohne `OPENVEREIN_URL` zeigt die App den mitgelieferten Web-Build. Das taugt nur zum Testen auf dem eigenen Rechner.

Die Adresse muss mit `https://` beginnen, sonst bricht der Build ab. So gehen Passwörter nie unverschlüsselt über die Leitung. Nur für die lokale Entwicklung erlaubt `OPENVEREIN_DEV_HTTP=true` auch `http://localhost`, `http://127.0.0.1` oder die Adresse des Android-Emulators `http://10.0.2.2`.

## Lokal bauen

```sh
npm ci && npm run build
OPENVEREIN_URL=https://verein.example.org npx cap sync
npx cap open android   # Android Studio (JDK 21, Android SDK)
npx cap open ios       # Xcode auf macOS (Swift Package Manager, kein CocoaPods)
```

## Codemagic

`codemagic.yaml` hat vier Workflows:

- **android-debug** und **ios-debug** bauen unsignierte Debug-Artefakte (APK, Simulator-App). Sie brauchen keine Zugangsdaten und laufen in jedem Fork.
- **android-release** baut ein signiertes AAB, **ios-release** ein signiertes IPA und lädt es zu TestFlight hoch.

Für die Release-Workflows richtest Du einmalig in Codemagic ein (Team settings):

1. **Android-Keystore**: Code signing identities → Android keystores → lade den Keystore mit dem Referenznamen `openverein` hoch. Codemagic stellt ihn als `CM_KEYSTORE_PATH`, `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS` und `CM_KEY_PASSWORD` bereit. `android/app/build.gradle` signiert das Release damit; ohne sie bleibt es unsigniert.
2. **App Store Connect**: Integrations → App Store Connect → füge einen API-Schlüssel mit dem Namen `OpenVerein App Store Connect` hinzu. Code signing identities → iOS-Zertifikate und Provisioning Profiles für die Bundle-ID (oder lass Codemagic sie automatisch holen).
3. **Environment group `openverein_release`** mit `OPENVEREIN_URL`, `OPENVEREIN_APP_ID` und `OPENVEREIN_APP_NAME` für die App des Vereins. Markiere hier nichts als geheim; diese Werte landen in der App.

Committe nie Keystores, Zertifikate, Provisioning Profiles oder API-Schlüssel. Sie liegen nur in Codemagic.

Die Build-Nummern kommen für Android aus Codemagic (`BUILD_NUMBER`). Für iOS setzt Du die Version in Xcode oder mit `agvtool` in einem Pre-Build-Schritt, wenn Du oft veröffentlichst.
