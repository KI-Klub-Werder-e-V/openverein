# Sicherheitsrichtlinie

OpenVerein verwaltet personenbezogene Daten und Vereinsfinanzen. Wir nehmen Sicherheitslücken ernst und danken Dir für jede verantwortungsvolle Meldung.

## Unterstützte Versionen

OpenVerein ist in früher Entwicklung. Sicherheitskorrekturen gibt es für den aktuellen Stand des Branches `main`. Wenn Du OpenVerein selbst betreibst, halte Deine Instanz mit `./ovctl update` aktuell.

## Lücke melden

**Bitte melde Sicherheitslücken nicht als öffentliches Issue, nicht in Pull Requests und nicht in Diskussionen.**

Melde sie vertraulich über GitHub:

1. Öffne den Tab [Security](https://github.com/KI-Klub-Werder-e-V/openverein/security) des Repositorys.
2. Klick auf **Report a vulnerability** und füll das Formular aus ([direkter Link](https://github.com/KI-Klub-Werder-e-V/openverein/security/advisories/new)).

Die Meldung sehen nur Du und die Maintainer. Falls die Schaltfläche bei Dir nicht erscheint, schreib den Maintainern über GitHub, dass Du eine vertrauliche Meldung hast, ohne Details zu nennen; wir melden uns dann mit einem vertraulichen Weg.

Hilfreich sind:

- betroffene Funktion, Route oder Datei
- Schritte zum Nachstellen oder ein Proof of Concept
- mögliche Auswirkungen (zum Beispiel Zugriff auf fremde Mitgliederdaten oder Finanzbuchungen)
- Version oder Commit, mit dem Du getestet hast

## Was Dich erwartet

- Wir bestätigen den Eingang so schnell wie möglich.
- Wir halten Dich über Bewertung und Korrektur auf dem Laufenden.
- Nach der Korrektur veröffentlichen wir ein Security Advisory und nennen Dich gern als Finder, wenn Du das möchtest.

## Spielregeln beim Testen

- Teste nur auf Deiner eigenen Instanz oder lokal mit dem Demoverein (`npm run seed:demo`).
- Die öffentliche Demo unter https://klub2.ki-klub-werder.de ist für alle da: kein Lasttest, keine automatisierten Scans, keine Versuche, andere Besucher zu stören.
- Greif nicht auf echte Vereinsdaten zu und verändere oder lösche keine Daten Dritter.
