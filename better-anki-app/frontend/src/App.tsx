import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { detectAnkiProfiles, openCollection, type ProfileInfo } from "@/lib/tauri";
import { DeckList } from "./components/decks/DeckList";
import { StudySession } from "./components/study/StudySession";
import { useDecks } from "./hooks/useDecks";
import type { DeckSummary } from "@/lib/tauri";

type Screen = "profile" | "decks" | "study";

function App() {
  const [screen, setScreen] = useState<Screen>("profile");
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [studyDeck, setStudyDeck] = useState<DeckSummary | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const { decks, loading, error, selectDeckForStudy } = useDecks();

  useEffect(() => {
    detectAnkiProfiles()
      .then(setProfiles)
      .catch((e) => setProfileError(e instanceof Error ? e.message : String(e)));
  }, []);

  const handleOpenProfile = async (path: string) => {
    setProfileError(null);
    try {
      await openCollection(path);
      setScreen("decks");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setProfileError(msg === "ERR_COLLECTION_LOCKED" 
        ? "Anki Desktop is open. Close it to study in Better-Anki."
        : msg);
    }
  };

  const handleStudyDeck = async (deck: DeckSummary) => {
    const ok = await selectDeckForStudy(deck.id);
    if (ok) {
      setStudyDeck(deck);
      setScreen("study");
    }
  };

  if (screen === "profile") {
    return (
      <div className="min-h-screen bg-ba-bg p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-lg"
        >
          <h1 className="font-display text-3xl font-bold text-ba-text">
            Better Anki
          </h1>
          <p className="mt-2 text-ba-muted">
            Select an Anki profile to open your collection.
          </p>
          {profileError && (
            <div className="mt-4 rounded-xl border border-ba-red/30 bg-ba-red/10 px-4 py-3 text-ba-red">
              {profileError}
            </div>
          )}
          <div className="mt-6 space-y-2">
            {profiles.length === 0 && !profileError && (
              <p className="text-ba-muted">Scanning for profiles...</p>
            )}
            {profiles.map((p) => (
              <button
                key={p.collection_path}
                onClick={() => handleOpenProfile(p.collection_path)}
                className="block w-full rounded-xl border border-[var(--ba-border)] bg-ba-surface px-4 py-3 text-left text-ba-text transition-colors hover:bg-ba-surface2"
              >
                {p.name}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (screen === "study" && studyDeck) {
    return (
      <div className="min-h-screen bg-ba-bg p-8">
        <StudySession
          deckId={studyDeck.id}
          deckName={studyDeck.name}
          onBack={() => {
            setStudyDeck(null);
            setScreen("decks");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ba-bg p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl"
      >
        <h1 className="font-display text-2xl font-bold text-ba-text">
          Your decks
        </h1>
        <DeckList
          decks={decks}
          loading={loading}
          error={error}
          onStudy={handleStudyDeck}
        />
      </motion.div>
    </div>
  );
}

export default App;
