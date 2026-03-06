import { motion } from "framer-motion";
import type { DeckSummary } from "@/lib/tauri";

interface DeckCardProps {
  deck: DeckSummary;
  onStudy: () => void;
}

export function DeckCard({ deck, onStudy }: DeckCardProps) {
  const total = deck.new_count + deck.learn_count + deck.review_count;
  const hasDue = total > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--ba-border)] bg-ba-surface p-6 shadow-lg transition-shadow hover:shadow-xl"
    >
      <h3 className="font-display text-lg font-bold text-ba-text">{deck.name}</h3>
      <div className="mt-3 flex gap-4 text-sm text-ba-muted">
        <span className={deck.new_count > 0 ? "text-ba-accent" : ""}>
          {deck.new_count} new
        </span>
        <span className={deck.learn_count > 0 ? "text-ba-yellow" : ""}>
          {deck.learn_count} learn
        </span>
        <span className={deck.review_count > 0 ? "text-ba-green" : ""}>
          {deck.review_count} review
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onStudy}
        disabled={!hasDue}
        className={`mt-4 rounded-xl px-4 py-2 font-medium transition-colors ${
          hasDue
            ? "bg-ba-accent text-white hover:opacity-90"
            : "cursor-not-allowed bg-ba-surface2 text-ba-muted"
        }`}
      >
        Study
      </motion.button>
    </motion.div>
  );
}
