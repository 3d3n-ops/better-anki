import { motion } from "framer-motion";
import { DeckCard } from "./DeckCard";
import type { DeckSummary } from "@/lib/tauri";

interface DeckListProps {
  decks: DeckSummary[];
  loading: boolean;
  error: string | null;
  onStudy: (deck: DeckSummary) => void;
}

export function DeckList({ decks, loading, error, onStudy }: DeckListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl bg-ba-surface"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-ba-red/30 bg-ba-red/10 px-4 py-3 text-ba-red"
      >
        {error}
      </motion.div>
    );
  }

  if (decks.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-ba-muted"
      >
        No decks found. Create one in Anki Desktop first.
      </motion.p>
    );
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} onStudy={() => onStudy(deck)} />
      ))}
    </motion.div>
  );
}
