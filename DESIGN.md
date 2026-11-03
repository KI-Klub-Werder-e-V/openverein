---
name: OpenVerein
description: Open-Source-Vereinsverwaltung für Ehrenamtliche in Deutschland, gezeichnet wie ein Hallenboden.
colors:
  ground: "#f3f4f1"
  surface: "#ffffff"
  surface-sunk: "#eceee9"
  rail: "#12355b"
  rail-raised: "#1b4471"
  rail-ink: "#e9eff6"
  rail-ink-muted: "#a9bdd2"
  ink: "#14202e"
  ink-2: "#47525f"
  ink-3: "#5f6874"
  line: "#d8dbd4"
  line-strong: "#858b83"
  accent: "#bf3a13"
  accent-hover: "#a5310f"
  accent-ink: "#ffffff"
  accent-soft: "#fbe9e3"
  ok: "#2b7a4b"
  ok-soft: "#e3f1e8"
  warn: "#8f5a00"
  warn-soft: "#fbf0d9"
  danger: "#b42318"
  danger-soft: "#fbe7e5"
  demo: "#f2c230"
  court-blau: "#1f5fa8"
  court-gruen: "#2b7a4b"
  court-rot: "#c43b3b"
  court-gelb: "#c99a06"
  court-orange: "#d9661a"
  court-tuerkis: "#13867f"
  court-grau: "#6b7480"
  court-schwarz: "#1d232b"
typography:
  display:
    fontFamily: "'Barlow Semi Condensed', 'Source Sans 3 Variable', sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Barlow Semi Condensed', 'Source Sans 3 Variable', sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Barlow Semi Condensed', 'Source Sans 3 Variable', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Source Sans 3 Variable', 'Source Sans 3', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  body-dense:
    fontFamily: "'Source Sans 3 Variable', 'Source Sans 3', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Source Sans 3 Variable', 'Source Sans 3', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.55
  figure:
    fontFamily: "'Barlow Semi Condensed', 'Source Sans 3 Variable', sans-serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "'tnum' 1"
rounded:
  sm: "2px"
  md: "4px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  s-8: "64px"
components:
  button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-dense}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-hover:
    backgroundColor: "{colors.surface-sunk}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    typography: "{typography.body-dense}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.surface-sunk}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  segmented-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "3px"
  rail:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.rail-ink}"
    width: "232px"
  rail-link-current:
    backgroundColor: "{colors.rail-raised}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    height: "36px"
  table-wrap:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
  table-row:
    typography: "{typography.body-dense}"
    height: "44px"
    padding: "0 12px"
  table-row-selected:
    backgroundColor: "{colors.accent-soft}"
  sheet:
    backgroundColor: "{colors.surface}"
    width: "min(520px, 100vw)"
    padding: "24px"
  bulkbar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  demo-banner:
    backgroundColor: "{colors.demo}"
    textColor: "#2a2100"
    padding: "8px 48px"
  portal-tabs:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    height: "56px"
---

# Designsystem: OpenVerein

## Overview

**Leitbild: „Der Hallenboden“**

Die Admin-App ist ein ruhiger, heller Boden (Birkengrund) mit einer tiefen Hallenblau-Leiste am linken Rand. Struktur entsteht aus Linien: 1px-Haarlinien trennen Zeilen, Abschnitte und Teile eines Sheets, und jede Gruppe hat eine eigene Spielfeldlinien-Farbe, die als kurzer 2px-Strich erscheint, nie als gefüllte Fläche. Ein einziges Signal-Orangerot, entnommen der Handballlinie, markiert primäre Aktionen, den Fokus und die aktuelle Auswahl. Sonst hat nichts auf dem Bildschirm diese Farbe.

Die Dichte ist auf die Arbeit ausgelegt: Tabellen mit 44px-Zeilen bei 14px, der Seitentitel groß oben links mit einer einzeiligen Zusammenfassung darunter, und direkt darunter die Tabelle. Details öffnen sich in einem Sheet von rechts, sodass die Liste stehen bleibt. Bearbeitet wird direkt an Ort und Stelle. Cmd/Ctrl+K öffnet von überall eine Befehlspalette. Texte sind deutsch und verwenden „Du“.

Verworfen: eine farbige Kopfleiste über grauen Karten und gestapelte Modals (die easyVerein-Anti-Referenz) sowie die verbotenen generischen Merkmale, die unter „Don't“ aufgeführt sind.

**Wesentliche Merkmale:**
- Heller Grund, weiße Flächen nur dort, wo Daten stehen (Tabellen, Sheets, Eingabefelder, Portalkarten).
- Linien tragen die Struktur; es gibt keine Kartenschatten.
- Die Gruppenfarbe erscheint immer als kurze Spielfeldlinie neben dem Namen.
- Eine Akzentfarbe, nur für Aktion, Fokus und aktuelle Position.
- Display-Schrift für Überschriften und Kennzahlen, Textschrift für alles andere.
- Tastatur zuerst: Palette, Inline-Bearbeitung, Zeilenaktionen bei Hover und Fokus.

## Colors

Die Palette ist ein kühler, nahezu neutraler Boden mit einer tiefblauen Leiste, einem kräftigen Akzent und einem festen Satz Spielfeldlinien-Farben.

### Primärfarbe
- **Handballlinien-Orangerot** (accent): primäre Buttons, der Fokusring (`--focus` hat denselben Wert), die 24px-Spielfeldlinie unter dem aktuellen Leisten-Link, die Unterstreichung des aktuellen Einstellungs-Tabs, die Leiste des aktuellen Portal-Tabs, das heutige Datum im Monatsraster, der linke Rand der ausgewählten Palettenzeile, die Füllung von Checkboxen. Bei Hover dunkler zu accent-hover. **Akzent-Lasur** (accent-soft) ist die ausgewählte Tabellenzeile und die Textauswahl.

### Neutraltöne
- **Heller Birkenboden** (ground): Seitenhintergrund für App, Portal und Antragsformular.
- **Sheet-Weiß** (surface): Tabellen, Sheets, Eingabefelder, Buttons, Portalkarten, die Palette.
- **Abgelaufener Boden** (surface-sunk): Zeilen-Hover, Hover von Ghost-Buttons, Mulden für Inline-Formulare, Kalendertage außerhalb des Monats.
- **Hallenblau** (rail): Seitenleiste, mobile Kopfleiste, Seitenpanel der Anmeldung, Kopfleiste des Portals, die Vereinsmarke im Antragsformular. **Leisten-Anhebung** (rail-raised) ist der aktuelle Leisten-Link. **Leisten-Kreide** (rail-ink) und **Leisten-Dunst** (rail-ink-muted) sind Text auf der Leiste.
- **Hallentinte** (ink): Fließtext, Überschriften, das gedrückte Segment, die Leiste für Massenaktionen.
- **Tinte 2** (ink-2, 7,2:1 auf ground): Einleitungen, Tabellenköpfe, Beschriftungen in Faktenlisten.
- **Tinte 3** (ink-3, 5,3:1 auf surface): Platzhalter, Metaangaben, Datumsangaben, Achsenbeschriftungen.
- **Haarlinie** (line): jede 1px-Linie und jeder Tabellenrahmen.
- **Bedienkante** (line-strong, 3,5:1 auf surface): Rahmen von Buttons, Eingabefeldern, Auswahllisten, dem Segment-Control.

### Zustände
- **ok / warn / danger** mit ihren `-soft`-Lasuren: Hinweise (heller Hintergrund, kräftiger Text), Statuspunkte, die Warnliste im Mitglieder-Sheet, Feldfehler (danger, Gewicht 600).
- **Hallengelb** (demo): nur das Demo-Banner, Text #2a2100.

### Spielfeldlinien (Gruppen- und Kalenderfarben)
blau, gruen, rot, gelb, orange, tuerkis, grau, schwarz. Eine Gruppe oder ein Kalender speichert den Schlüssel; Komponenten setzen `--court: var(--court-<key>)` und zeichnen mit `var(--court, var(--court-grau))`.

### Benannte Regeln
**Die Ein-Signal-Regel.** Der Akzent markiert Aktion, Fokus und „Du bist hier“. Was nicht anklickbar, fokussiert, ausgewählt oder aktuell ist, ist nicht Akzent.

**Die Linie-statt-Fläche-Regel.** Spielfeldfarben werden als Linien gezeichnet (2-3px-Striche, eine 2px eingelassene Unterstreichung, ein 2px-Balken links), immer neben einer Textbeschriftung. Nie ein gefüllter Chip oder eine eingefärbte Karte.

## Typography

**Display-Schrift:** Barlow Semi Condensed 600 (Fallback Source Sans 3 Variable, sans-serif), selbst gehostet über @fontsource
**Textschrift:** Source Sans 3 Variable (Fallback Source Sans 3, system-ui, sans-serif), selbst gehostet über @fontsource

**Charakter:** Schmal laufende Überschriften wie Hallenbeschilderung über einer warmen, sehr gut lesbaren humanistischen Textschrift. Von der Display-Schrift wird nur das Gewicht 600 ausgeliefert.

### Hierarchie
- **Display** (600, 32px, 1.1, -0.01em): h1 der Seite, h1 in Portal und Antragsformular (Portal/Formular enger mit 1.05 / -0.02em).
- **Headline** (600, 22px): h2 eines Abschnitts, Sheet-Titel, Titel von Portalkarten.
- **Title** (600, 18px): h3, Abschnittsköpfe im Sheet, Vereinsname in der Leiste, Legenden von Formularen.
- **Body** (400, 15px, 1.55): Standardtext, Eingabefelder. Einleitungen höchstens 70ch, Vorschauen höchstens 62ch.
- **Body dense** (14px): Tabellen, Buttons (600), Feldbeschriftungen (600), Hinweise, Werkzeugleisten.
- **Label / Meta** (13px): Tabellenköpfe (600, ink-2), Hilfetexte, Metaangaben, Kalendereinträge, Beschriftungen der Portal-Tabs.
- **Figure** (Display 600, 32px, Zeilenhöhe 1, tabellarisch): Zahlen in der Übersicht, Beschriftung darunter in 14px ink-2.

### Benannte Regeln
**Die Tabellenziffern-Regel.** Fließtext behält proportionale Ziffern (`'tnum' 0` auf body). Zahlen, die sich ausrichten oder vergleichen (Geld- und Zahlenspalten, Datumsangaben in Zeitleisten und Spielfeldlinien-Beschriftungen, Kennzahlen), schalten Tabellenziffern ein, und Geldspalten sind rechtsbündig.

**Die Keine-Versalien-Regel.** Nirgends Beschriftungen in Großbuchstaben und keine gesperrten Kapitälchen; Hierarchie entsteht aus Größe, Gewicht und Farbe.

## Layout

- **Rahmen:** zweispaltiges Grid, Leiste 232px plus Hauptbereich. Seitenabstand 48px seitlich und oben, 64px unten, maximale Breite 1440px.
- **Seitenkopf:** h1 und einzeilige Einleitung oben links, Aktionen oben rechts (an flex-end ausgerichtet, bricht um), 32px Abstand zum Inhalt.
- **Rhythmus:** 8px-Raster mit 4px-Halbschritt (s-1 bis s-8). Abschnitte stehen 48px auseinander; h2 eines Abschnitts hat 16px Abstand darunter.
- **Höhe von Bedienelementen:** 36px, bei groben Zeigegeräten 44px.
- **Breakpoints:** 860px (die Leiste wird zur Off-Canvas-Schublade mit 56px-Kopfleiste in Hallenblau und Scrim; die Anmeldung stapelt sich), 760px (`hide-sm`-Spalten entfallen, Statusbeschriftungen werden 13px und dürfen umbrechen, Kalendertermine werden zu 4px-Balken, siehe Bekannte Ausnahmen), 560px (Formularzeilen stapeln sich, Agendazeilen stapeln sich), 900px (Editor stapelt sich über der Vorschau), 720px (Portal-Tabs wandern von unten in eine obere Reihe).
- **Formulare:** Spalte mit 16px Abständen; zweispaltige Zeilen, die unter 560px zusammenfallen.
- **Portal und Antragsformular:** eine zentrierte Spalte, höchstens 600px, Innenabstand 24px/16px.

## Elevation & Depth

Standardmäßig flach. Tiefe entsteht aus der Stufe zwischen ground und surface und aus Haarlinien. Nur was über der Seite schwebt, wirft einen Schatten.

### Schatten-Vokabular
- **Sheet-Kante** (`box-shadow: -12px 0 32px rgb(20 32 46 / 0.12)`): nur das Sheet rechts.
- **Pop** (`box-shadow: 0 12px 32px rgb(20 32 46 / 0.18)`): die Befehlspalette und die geöffnete mobile Leisten-Schublade.
- Hintergründe: Dialog `rgb(20 32 46 / 0.35)`, mobiler Scrim `rgb(20 32 46 / 0.4)`.

### Benannte Regeln
**Die Der-Boden-ist-flach-Regel.** Tabellen, Karten, Banner und Buttons tragen nie einen Schatten. Was auf dem Boden liegt, wird mit einer 1px-Haarlinie umrandet.

## Shapes

Eckige, handwerkliche Ecken: 4px an jedem Bedienelement, Tabellenrahmen, Hinweis, jeder Karte und jedem Segment-Container, 3px am gedrückten Segment und an kbd, 2px an Kalendereinträgen und Spielfeldlinien-Strichen. Kreise gibt es nur als Statuspunkte (7px), Checklisten-Häkchen (18px) und als offene Pfeilspitze an einer Spielfeldlinie (ein kleines Dreieck). Rahmen sind 1px; die einzigen 2px-Striche sind Spielfeldlinien, Fokus-Outlines und Unterstreichungen des aktuellen Tabs.

## Components

### Buttons
- **Form:** 4px Radius, 36px hoch (44px bei groben Zeigegeräten), 16px seitlicher Innenabstand, Text 14px/600, optional ein Lucide-Icon mit 16-18px und 8px Abstand.
- **Standard:** weiß mit Rahmen in Bedienkante; Hover Abgelaufener Boden.
- **Primär:** Akzentfüllung und -rahmen, weißer Text; Hover accent-hover. Einer pro Bereich einer Ansicht (Seitenkopf, Sheet-Fuß, Inline-Formular).
- **Ghost:** keine Füllung, kein Rahmen; Hover Abgelaufener Boden. Für Abbrechen und Zeilenaktionen mit wenig Tragweite.
- **Gefahr:** Standard oder Ghost mit danger-Text; nie eine rote Füllung.
- **Deaktiviert / beschäftigt:** Deckkraft 0.55, Cursor `not-allowed`; beschäftigt verwendet `aria-busy`.
- **Icon-Button:** quadratisch in Bedienhöhe, transparent, ink-2, Hover 12 % graue Lasur. Hat immer ein `aria-label`.
- **Linkartig:** Text-Button, ink-2 unterstrichen, für leise Aktionen in dichten Listen.

### Eingabefelder
- **Stil:** weiß, 1px Bedienkante, 4px Radius, 36px, 12px Innenabstand, 15px Text. Auswahllisten haben einen gezeichneten Chevron; Textareas beginnen bei 96px.
- **Hover:** Rahmen wird ink-3. **Fokus:** 2px Akzent-Outline mit Versatz 0 plus Akzentrahmen.
- **Fehler:** `aria-invalid` mit danger-Rahmen; Meldung in 13px/600 danger darunter.
- **Beschriftung:** 14px/600 ink darüber; Hilfetext 13px ink-3.
- **Suche:** vorangestelltes Icon bei 10px, nachgestellter kbd-Hinweis (`/`), höchstens 420px.

### Segment-Control
Gruppe ohne Pillenform in einem 1px-Rahmen aus Bedienkante mit 2px Innenabstand; das gedrückte Segment ist Hallentinte mit weißem Text; Hover Abgelaufener Boden. Für Listenansichten (Aktuell, Aktiv, Anträge, …).

### Tabellen
- Weißer Rahmen, 1px Haarlinie, 4px Radius, horizontales Scrollen innerhalb.
- Köpfe 13px/600 ink-2. Zeilen 44px, 14px, Haarlinie zwischen den Zeilen, keine nach der letzten.
- Zeilen-Hover Abgelaufener Boden; ausgewählte Zeile Akzent-Lasur; Tastaturfokus 2px eingelassene Akzent-Outline; anklickbare Zeilen zeigen einen Zeiger.
- Namenszelle 600 ink. Zahlen- und Geldzellen rechtsbündig, tabellarisch.
- **Zeilenaktionen** sind verborgen, bis die Zeile gehovert wird oder der Fokus in ihr liegt.
- **Massenleiste:** Sind Zeilen angehakt, erscheint über der Tabelle eine Leiste in Hallentinte mit weißem Text und 32px-Bedienelementen.
- Tabellenfuß: Zählzeile in 14px ink-3.

### Sheet
Natives `<dialog>` von rechts, `min(520px, 100vw)`, volle Höhe, Schatten Sheet-Kante, erscheint mit 24px Einschub und Einblendung (220ms). Kopf: Titel (h2, beim Öffnen fokussiert, damit kein Ring aufblitzt) und Icon-Button zum Schließen, Haarlinie darunter. Der Körper scrollt, 24px Innenabstand, Abschnitte durch Haarlinien getrennt, mit 18px-Köpfen und einer 9.5rem-Beschriftungsspalte für Fakten. Ein optionaler Fuß richtet Aktionen rechts aus. Escape und Klick auf den Hintergrund schließen es. Sheets ersetzen Modals; sie stapeln sich nicht.

### Inline-Bearbeitung
Der Wert ist ein Button mit gepunkteter Unterstreichung in Bedienkante und Text-Cursor; Hover Abgelaufener Boden; leere Werte lauten „hinzufügen“ in ink-3. Klick oder Enter macht daraus ein Eingabefeld mit Speichern (primär) und Abbrechen (Ghost). Enter speichert (Cmd/Ctrl+Enter in Textareas), Escape bricht ab, Validierungsfehler vom Server erscheinen inline mit `role="alert"`. Kein Modal.

### Befehlspalette
Nativer Dialog, höchstens 640px, 12vh vom oberen Rand, 6px Radius, Schatten Pop. 56px-Eingabefeld ohne Rahmen mit 18px und einer Haarlinie darunter; Ergebniszeilen mit 4px Radius, ausgewählte Zeile Abgelaufener Boden mit 2px eingelassenem Akzent links; Metaangaben rechtsbündig; Fußzeile mit kbd-Hinweisen in 13px ink-3.

### Navigation
- **Leiste:** Hallenblau, Vereinsname in der Display-Schrift mit 13px gedämpfter Unterzeile, ein „Suchen“-Auslöser für die Palette mit kbd-Hinweis (umrandet mit 22 % Leisten-Kreide), dann Links in Bedienhöhe mit 18px-Lucide-Icons. Hover: Text in Leisten-Kreide auf 6 % weißer Lasur. Aktuell: Füllung Leisten-Anhebung, weißer Text und eine 24px-Akzent-Spielfeldlinie unter der Beschriftung. Abmelden sitzt im Fuß unter einer Haarlinie.
- **Unternavigation:** Tabs in 14px/600 ink-2 auf einer Haarlinie; aktueller Tab ink mit 2px Akzent-Unterstreichung.
- **Mobil:** 56px-Kopfleiste in Hallenblau mit Menü-Icon-Button; die Leiste fährt als Schublade herein.

### Spielfeldlinien (Markenzeichen)
- **Gruppen-Badge:** ein 14×2px-Strich in der Gruppenfarbe, 6px Abstand, dann der Gruppenname in 14px. In Tabellen, Sheets und im Portal.
- **Mitgliedschaftsverlauf:** Jede Mitgliedschaft ist eine 3px-Linie auf einer gestrichelten Haarlinien-Spur entlang einer gemeinsamen Zeitachse, vom Anfangs- bis zum Enddatum; offene Mitgliedschaften enden in einer kleinen Pfeilspitze. Gruppenname links, tabellarische Daten rechts, Beenden-Aktion erscheint bei Hover/Fokus. Eine Achse darunter zeigt das erste Datum und „heute“.
- **Kalender:** Termine im Monatsraster tragen eine 2px eingelassene Unterstreichung in ihrer Kalenderfarbe (unter 760px durchgehende 4px-Balken); Agenda-Einträge tragen einen 2px-Balken links. Das heutige Datum ist eine Akzentkachel.
- **Anmeldepanel:** dezente Spielfeldmarkierungen als SVG über dem Hallenblau-Seitenpanel (dekorativ, `aria-hidden`).

### Status
Ein 7px-Punkt in der Zustandsfarbe plus die Beschriftung in derselben Farbe mit 14px: aktiv ok, künftig court-blau, Antrag/gekündigt warn, ehemalig ink-3, abgelehnt danger. `data-s` wählt einen dieser Farbplätze; Rechnungen, Mandate, Zustellungen, SEPA-Posten und Importzeilen bilden ihre eigenen Zustände auf dieselben Plätze ab.

### Hinweise und Checkliste
Hinweise: 4px Radius, helle Lasur, kräftiger Text, 14px, kein Icon-Kasten. Checkliste in der Übersicht: durch Haarlinien getrennte Zeilen mit einem 18px-Kreis als Häkchen; erledigte Zeilen füllen das Häkchen ok-grün und streichen die Beschriftung in ink-2 durch.

### Mitgliederportal
Telefon zuerst. Kopfleiste in Hallenblau mit dem Vereinsnamen und einem 44px-Abmelden. Eine Spalte bis 600px. Untere Tab-Leiste (3 Tabs, 56px, weiß, Haarlinie oben, berücksichtigt die Safe Area); der aktuelle Tab ist ink/600 mit einem 3px-Akzentbalken an seiner Oberkante. Ab 720px wandern die Tabs in eine zentrierte obere Reihe mit dem Balken unter dem aktuellen Tab. Der Inhalt verwendet weiße Karten (1px Haarlinie, 4px Radius, 16px Innenabstand) und Haarlinien-Listen mit 56px hohen, antippbaren Zeilen; eine fällige Zahlung erscheint als Zeile, die mit einer kurzen Akzentlinie beginnt.

## Do's and Don'ts

### Do:
- **Nimm** jede Farbe, Größe, jeden Abstand und jede Dauer aus `tokens.css`; neue Gruppenfarben bekommen ein `--court-*`-Token.
- **Halte** den Akzent für primäre Aktion, Fokus, Auswahl und aktuelle Position frei.
- **Zeichne** Gruppen- und Kalenderfarbe als kurze Linie neben ihrem Namen.
- **Öffne** Detail- und Bearbeitungsabläufe im Sheet rechts oder inline; lass die Liste sichtbar.
- **Richte** Geld- und Zahlenspalten rechtsbündig mit Tabellenziffern aus.
- **Zeige** Zeilenaktionen bei Hover und focus-within, versteck sie nie vor Tastaturnutzern.
- **Halte** Fließtext bei 15px und Metaangaben bei mindestens 13px; behalte die 2px-Akzent-Fokus-Outline an jedem interaktiven Element.
- **Gib** Bedienelementen 44px bei groben Zeigegeräten und im Portal.
- **Schreibe** deutsche UI-Texte mit „Du“; kennzeichne Demodaten mit dem gelben Demo-Banner.
- **Setze** jede Bewegung unter `prefers-reduced-motion` auf null (bereits global).

### Don't:
- **Keine** farbige Kopfleiste über grauen Karten und keine gestapelten Modals (die easyVerein-Anti-Referenz).
- **Kein** zentrierter Hero mit Verlaufs-Blob, keine drei identischen Karten, kein Glassmorphism, keine Lila-Verläufe, kein rounded-2xl mit shadow-lg.
- **Keine** Schatten auf Tabellen, Karten, Buttons oder Bannern.
- **Nicht mehr** als 4px Radius an Bedienelementen und Containern.
- **Keine** Chips oder Karten, die mit einer Gruppenfarbe gefüllt sind.
- **Keine** Overline- oder Kicker-Beschriftungen in Großbuchstaben über Überschriften.
- **Keine** Emojis oder Textzeichen als Icons; Icons sind Lucide-SVGs mit 14-18px.
- **Keine** Schriften, Tracker oder CDNs von Dritten laden; Schriften kommen über @fontsource.
- **Keine** erfundenen Statistiken oder Testimonials; Zahlen in der Übersicht sind Live-Zählungen.
- **Farbe nie** allein Bedeutung tragen lassen; jeder Status und jede Spielfeldfarbe bekommt Text dazu.

## Bekannte Ausnahmen

Der Code bricht einige der obigen Regeln absichtlich oder als offene Schuld. Übernimm sie nicht in neue Arbeit und „repariere“ sie nicht ohne Entscheidung:

- **`.pill`** (neutrales Meta-Tag: „Standard“, „minderjährig“, „Rundschreiben“) ist vollständig abgerundet mit grauer Füllung. Es ist die einzige abgerundete Form; neue Tags verwenden sie, statt eine weitere zu erfinden.
- **Befehlspalette** verwendet 6px Radius.
- **Kalender auf dem Telefon:** Unter 760px sind Termine im Monatsraster farbige 4px-Balken ohne Text; das bricht die 44px-Zielgröße und die Regel „nie Farbe allein“. Schuld: die Tageszelle zum Ziel machen und eine Anzahl zeigen.
- **Fest kodierte Farben:** `#fff` auf Akzent und dunklen Flächen, die Spielfeldlinien im SVG des Anmeldepanels und die QR-Codes. Alles andere kommt aus Tokens.
- **`kbd`**-Hinweise sind 12px, unter der 13px-Untergrenze für Metaangaben.
- **Pfeile in Linktexten** („← Zurück“, „× aufheben“) sind Textzeichen, keine Icons.
