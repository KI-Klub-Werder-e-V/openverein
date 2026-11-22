## MODIFIED Requirements

### Requirement: Kalenderansichten
Das System MUSS (SHALL) Monats-, Wochen-, Tages- und Listenansichten mit einem Schalter für eine Geburtstagsebene anzeigen, die Feldeinschränkungen für das Geburtsdatum beachtet.

#### Scenario: Geburtstagsebene eingeschränkt
- **WHEN** ein:e Benutzer:in ohne Recht auf das Geburtsdatum die Geburtstagsebene einschaltet
- **THEN** werden keine Geburtstage angezeigt

#### Scenario: Geburtstagsebene wieder ausschalten
- **WHEN** ein:e Benutzer:in die Geburtstagsebene einschaltet und danach wieder ausschaltet
- **THEN** werden keine Geburtstage mehr angezeigt
