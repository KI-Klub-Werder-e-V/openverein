## Entscheidung

Die Ansicht leitet die anzuzeigende Geburtstagsliste aus dem Schalter ab (`showBirthdays ? daten : []`), statt sich auf `enabled` der Abfrage zu verlassen. `enabled: false` verhindert nur das Laden, nicht die Anzeige gecachter Daten.
