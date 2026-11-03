# ADR 0002: PDF-Erzeugung mit pdfkit statt Typst

Datum: 2026-10-24. Status: angenommen.

## Kontext

Deliverable A wählt die Typst-CLI für jedes PDF (Rechnungen, Belege, Briefe). Das bringt ein natives Binary und Schriften ins Image und eine Vorlagensprache, die Mitwirkende erst lernen müssen.

## Entscheidung

PDFs werden im Prozess mit `pdfkit` erzeugt (gepflegt, reines JavaScript), der EPC-QR-Code wird mit `lean-qr` gezeichnet (keine Abhängigkeiten). Eingebettet werden die TTF-Dateien von Source Sans 3 aus dem Paket `source-sans` (SIL OFL), damit jeder Name aus Latin Extended korrekt dargestellt wird. Das Layout folgt DIN 5008 Form B (Anschriftfeld bei 45 mm).

`pdf-lib` wurde verworfen: kein Release seit 2022. `qrcode` wurde verworfen: letztes Release liegt mehr als 90 Tage zurück.

## Konsequenzen

Dokumente sind Code (`src/server/invoices/pdf.ts`). Falls die Vorlagen für viele Dokumentarten unhandlich werden, Typst für den Brief-Slice neu prüfen. Ausgestellte Dokumente werden einmal gespeichert; ein Wechsel des Renderers verändert also nie ein bestehendes PDF.
