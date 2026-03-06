## Better‑Anki Feature Roadmap

### Core 1.0

- **Profile & collection detection**
  - Detect Anki2 base directory per platform.
  - Enumerate profiles and find each `collection.anki2`.
  - Handle locked collection with explicit `ERR_COLLECTION_LOCKED` error.

- **Collection lifecycle**
  - Open/close `Collection` via `rslib` in a managed `AppState`.
  - Reload collection after sync or fatal errors.

- **Deck list (home)**
  - Fetch all decks with basic stats (new/learn/review counts, due today).
  - Dark‑first deck grid UI with search, sort, and quick filters.
  - Per‑deck “Study” CTA that starts a session.

- **Study session**
  - Fetch due cards for a deck via `rslib` scheduler.
  - Session state in `sessionStore` + `useStudySession`.
  - Card flip and rating via keyboard shortcuts (space/enter/1–4/arrows).
  - End‑of‑session summary (correct/again, time, accuracy, XP hook).

- **Card swipe interaction**
  - `CardSwipe` implementing FRONT/BACK/ANIMATING_OUT states.
  - Drag mechanics per spec (thresholds, overlays, rotation, springs).
  - Card stack depth effect for next cards.

- **Gamification**
  - Local `userdata.db` for XP, streak, combo data (separate from Anki DB).
  - `useGamification` hook + `XPToast`, `StreakBadge`, `ComboFlash`.
  - Session summary integrating XP / streak / combo milestones.

- **Sync**
  - AnkiWeb login + stored creds (in Better‑Anki prefs, not Anki DB).
  - `sync_pull` / `sync_push` commands calling `rslib` sync.
  - UI sync state via `syncStore` + `useSync` and clear feedback to user.

### UX & Polish

- **Design system**
  - Tailwind theme tokens for the Better‑Anki palette and typography.
  - Shared `ui/` primitives (Button, Card, Modal, skeletons).
  - Accessible focus states, reduced‑motion handling.

- **Stats**
  - `StatsPanel` with accuracy, review counts, and streak summary.
  - `ActivityHeatmap` mirroring Anki’s activity view, styled to match BA.

- **Onboarding & prefs**
  - First‑run profile picker and test deck option.
  - Preferences UI wired to `prefsStore` (reduced motion, theme, etc.).

### Backend plumbing (Tauri)

- **Tauri 2 app skeleton**
  - `better-anki-app/src-tauri` with `AppState` and basic wiring.
  - Commands: `detect_anki_path`, `list_profiles`, `open_collection`, `get_decks`, `get_due_cards`, `answer_card`, `sync_pull`, `sync_push`.
  - Typed IPC wrappers in `frontend/src/lib/tauri.ts`.

### Testing

- **Rust**
  - Fixture `collection.anki2` and unit tests for each command.

- **Frontend**
  - Vitest tests for `CardSwipe` gestures and keyboard shortcuts.
  - XP / streak / combo logic tests.

