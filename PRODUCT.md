# Product

<!-- impeccable:product-schema 1 -->

_Abgeleitet aus dem Briefing des Eigentümers und der Recherche in `saaskiller/easyverein/` (in diesem unbeaufsichtigten Build war keine Interviewrunde möglich; jede Angabe unten stammt aus diesen schriftlichen Quellen)._

## Platform

web

## Stack

delegated: React-19- und Vite-SPA auf einer Fastify-REST-API (OpenAPI) und PostgreSQL; derselbe Web-Build wird mit Capacitor für iOS und Android verpackt. Siehe `docs/adr/`.

## Users

Ehrenamtliche, die einen eingetragenen Verein (e.V.) mit 100 bis 2.000 Mitgliedern führen: Kassenwart, Vorstand, Abteilungsleitungen und Trainer:innen. Sie erledigen das abends nach der Arbeit, am Laptop am Küchentisch oder am Handy zwischen zwei Trainingseinheiten. Die Mitglieder selbst nutzen das Mitgliederportal, um ihre Daten, Rechnungen und ihr Mandat zu sehen.

## Product Purpose

OpenVerein ist eine Open-Source-Vereinsverwaltung (AGPL-3.0): Mitglieder, Gruppen, Beiträge und Rechnungen, SEPA-Lastschrift, Buchhaltung, Termine, E-Mail, Dokumente und ein Mitgliederportal. Sie ersetzt easyVerein, ein kostenpflichtiges SaaS, damit ein Verein seine Daten besitzt, selbst hosten und jederzeit alles exportieren kann. Erfolg heißt: Ein Kassenwart erledigt einen kompletten Beitragslauf ohne Tabellenkalkulation und ohne Angst, ein Mitglied doppelt zu belasten.

## Positioning

Im eigenen Besitz, offen und exportierbar, mit Geldwegen, die nachweislich sicher sind (Vorschau vor jedem Beitragslauf, Schutz in der Datenbank gegen doppelte Rechnungen und doppelte Lastschriften). Die fachliche Referenz ist easyVerein; seine UX (überladene grüne Kopfleisten, endlose Dialoge, Upsell-Banner) ist die Anti-Referenz.

## Operating Context

Echte Vereinsrituale: der jährliche oder vierteljährliche Beitragslauf, die SEPA-Lastschriftdatei, die ins Bankportal hochgeladen wird, Kontoauszüge als CAMT-Dateien, die Mitgliederversammlung, der DATEV-Export für die Steuerberatung. Ehrenamtliche wechseln zwischen dieser App, dem Onlinebanking und dem E-Mail-Postfach. Jede Aktion in der Oberfläche muss auch über die REST-API möglich sein, weil ein Schwesterprojekt auf derselben Fachdomäne eine Oberfläche baut, die zuerst für Agenten gedacht ist.

## Capabilities and Constraints

Siehe `openspec/specs/` (die maßgebliche Quelle für das Verhalten). Texte zuerst auf Deutsch, die Nutzer:innen mit „Du“ ansprechen. Geld sind ganzzahlige Cent. Keine Tracker, Schriften oder Captchas von Dritten (DSGVO). Ein öffentlicher Demomodus mit einem erfundenen Verein, klar als Demodaten gekennzeichnet, gehört zum MVP.

## Brand Commitments

Name: OpenVerein. Verbindliche Vorgabe des Eigentümers: Es muss sich anfühlen, als hätte es ein Spitzen-Produktdesigner gebaut; geschmeidig, minimal, ruhig, schnell. Von der Typografie geführt, großzügiger Weißraum, eine Akzentfarbe, dichte, aber gut lesbare Tabellen, zuerst für die Tastatur (Befehlspalette, Bearbeiten direkt in der Zeile, Seitenleisten statt gestapelter Dialoge). Verboten: zentrierter Hero mit Farbverlaufs-Blob, drei identische Karten, Glassmorphism, lila Farbverläufe, rounded-2xl + shadow-lg auf allem, Typografie nur mit Inter, erfundene Zahlen, Emoji als Icons.

## Evidence on Hand

Keine echten Vereinsdaten, Kunden oder Erfahrungsberichte. Demoinhalte sind synthetisch und müssen überall, wo sie erscheinen, als Demodaten gekennzeichnet sein. Screenshots des Referenzprodukts: `../saaskiller/easyverein/screens/30-app-*.png` (Anti-Referenz).

## Product Principles

1. Nichts berührt das Konto eines Mitglieds ohne vorherige Vorschau.
2. Ruhig statt raffiniert: Das Werkzeug verschwindet hinter der Aufgabe der Ehrenamtlichen.
3. Jede Aktion ist per Tastatur und per API erreichbar.
4. Der Verein besitzt seine Daten: alles exportieren, jederzeit.

## Accessibility & Inclusion

WCAG 2.2 AA. Viele Ehrenamtliche sind älter: Fließtext mindestens 15px, sichtbarer Fokus, keine Information allein über Farbe.
