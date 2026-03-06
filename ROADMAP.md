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

### Distribution & install (binary + terminal)

- **Build artifacts**
  - Use Tauri’s `tauri build` in `better-anki-app/` to produce:
    - **macOS**: `.dmg` and optionally `.app` (for Homebrew cask).
    - **Windows**: `.msi` and/or `.exe` installer.
    - **Linux**: `.deb`, `.AppImage`, or `.rpm` (Tauri 2 supports these).
  - Ensure `rslib` (and any native deps) are built in CI (e.g. `./check` or `cargo build --release` for the workspace, then build the app against it).

- **Terminal install**
  - **Option A – Homebrew (macOS/Linux)**
    - **Formula**: `better-anki` formula that downloads the latest GitHub release tarball/zip (e.g. `better-anki-app_*_x64.dmg` or binary), extracts and installs the app/binary.
    - **Tap**: e.g. `brew tap 3d3n-ops/better-anki` then `brew install better-anki`.
  - **Option B – curl | sh**
    - Install script (e.g. `install.sh`) that:
      - Detects OS/arch, downloads the right asset from GitHub Releases.
      - On macOS: mount `.dmg`, copy `.app` to `/Applications`, unmount.
      - On Linux: download `.AppImage` or `.deb`, install or place in `~/.local/bin`.
      - On Windows: download installer and run (or provide `winget`/scoop later).
  - **Option C – Cargo**
    - Optional: a small `better-anki-bin` crate in the repo that wraps launching the Tauri app (or a CLI that opens it). Users run `cargo install better-anki-bin` after building the Tauri app once. Less ideal for non-Rust users; good for devs.

- **CI / releases**
  - **GitHub Actions**: workflow on tag push (e.g. `v0.1.0`) that:
    - Runs tests and `./check` (or at least `cargo check` + frontend build).
    - Builds `better-anki-app` with `tauri build` for macOS (x64 + arm64), Windows (x64), Linux (x64).
    - Uploads artifacts and creates a GitHub Release with install instructions (Homebrew, curl script, direct download).
  - **Versioning**: align `better-anki-app` version with release tags (e.g. in `tauri.conf.json` and `package.json`).
</think>

