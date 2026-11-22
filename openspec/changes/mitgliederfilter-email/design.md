## Decisions

- **Blocked addresses are looked up in the application, not in SQL.** The suppression list stores a keyed hash of the address (`emailHash`), which the database cannot compute. For `present` and `undeliverable` the server hashes the club's addresses once per request and filters by person ID. That is one query over the club's people with an address, which is fine at club sizes. With no blocked address it is skipped.
- **"vorhanden" excludes blocked addresses**, so present, missing and undeliverable split the list. Typical use: "fehlt" plus "unzustellbar" are the people who need a letter.
- **The list filter became async** (`listFilter(db, …)`) to load the blocked people first. All five callers (list, total, IDs, CSV, PDF/vCard) use it unchanged otherwise.
