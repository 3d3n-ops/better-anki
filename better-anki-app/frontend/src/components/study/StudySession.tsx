import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardSwipe } from "./CardSwipe";
import { RatingButtons } from "./RatingButtons";
import { Button } from "../ui/Button";
import { useStudySession } from "@/hooks/useStudySession";

interface StudySessionProps {
  deckId: number;
  deckName: string;
  onBack: () => void;
}

export function StudySession({ deckId, deckName, onBack }: StudySessionProps) {
  const { card, loading, error, rate } = useStudySession(deckId);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionEnded, setSessionEnded] = useState<{
    correct: number;
    again: number;
    total: number;
  } | null>(null);

  const handleRate = useCallback(
    async (rating: number, msTaken: number = 0) => {
      const result = await rate(rating, msTaken);
      if (result) {
        setSessionEnded(result);
      }
      setIsFlipped(false);
    },
    [rate]
  );

  const handleFlip = useCallback(() => setIsFlipped(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (isFlipped) handleRate(3, 0);
        else handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isFlipped) handleRate(3, 0);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isFlipped) handleRate(1, 0);
      } else if (["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        if (isFlipped) handleRate(parseInt(e.key, 10), 0);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [card, isFlipped, handleRate, handleFlip]);

  if (sessionEnded) {
    const { correct, again, total } = sessionEnded;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    let message = "";
    if (accuracy >= 90) message = "Flawless. Your brain is a machine.";
    else if (accuracy >= 70) message = "Solid session. Consistency beats perfection.";
    else if (accuracy >= 50) message = "Good effort. The hard ones will stick with repetition.";
    else message = "Tough deck. Anki will space these out — you'll get there.";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-md space-y-6 rounded-2xl border border-[var(--ba-border)] bg-ba-surface p-8"
      >
        <h2 className="font-display text-2xl font-bold">Session complete</h2>
        <div className="flex justify-between gap-4 text-sm">
          <span className="text-ba-green">{correct} correct</span>
          <span className="text-ba-red">{again} again</span>
          <span>{total} total</span>
        </div>
        <p className="text-ba-muted">{message}</p>
        <Button onClick={onBack}>Back to decks</Button>
      </motion.div>
    );
  }

  if (loading && !card) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ba-accent border-t-transparent" />
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

  if (!card) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className="text-ba-muted">No cards due. Great job!</p>
        <Button onClick={onBack} className="mt-4">
          Back to decks
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <span className="text-sm text-ba-muted">
          {deckName} · {card.new_count + card.learning_count + card.review_count} due
        </span>
      </div>

      <AnimatePresence mode="wait">
        <CardSwipe
          key={card.card_id}
          question={card.question}
          answer={card.answer}
          css={card.css}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onRate={handleRate}
        />
      </AnimatePresence>

      <div className="flex flex-col items-center gap-4">
        {!isFlipped ? (
          <p className="text-sm text-ba-muted">Space or click to reveal</p>
        ) : (
          <RatingButtons onRate={(r) => handleRate(r, 0)} />
        )}
      </div>
    </div>
  );
}
