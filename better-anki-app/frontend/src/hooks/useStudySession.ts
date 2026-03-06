import { useState, useCallback, useEffect, useRef } from "react";
import { getNextCard, answerCard } from "@/lib/tauri";
import type { CardForReview } from "@/lib/tauri";

export interface SessionStats {
  correct: number;
  again: number;
  total: number;
}

export function useStudySession(deckId: number | null) {
  const [card, setCard] = useState<CardForReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const correctRef = useRef(0);
  const againRef = useRef(0);
  const totalRef = useRef(0);

  const fetchNext = useCallback(async () => {
    if (deckId == null) return null;
    setLoading(true);
    setError(null);
    try {
      const next = await getNextCard();
      setCard(next ?? null);
      if (!next) {
        return { done: true, correct: correctRef.current, again: againRef.current, total: totalRef.current } as const;
      }
      return { done: false } as const;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return { done: true, correct: correctRef.current, again: againRef.current, total: totalRef.current } as const;
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  const rate = useCallback(
    async (rating: number, msTaken: number): Promise<SessionStats | null> => {
      if (!card) return null;
      setError(null);
      try {
        await answerCard(card.card_id, rating, msTaken);
        if (rating === 1) againRef.current += 1;
        else correctRef.current += 1;
        totalRef.current += 1;
        const result = await fetchNext();
        if (result?.done) {
          return { correct: result.correct, again: result.again, total: result.total };
        }
        return null;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return { correct: correctRef.current, again: againRef.current, total: totalRef.current };
      }
    },
    [card, fetchNext]
  );

  useEffect(() => {
    correctRef.current = 0;
    againRef.current = 0;
    totalRef.current = 0;
    if (deckId != null) fetchNext();
    else setCard(null);
  }, [deckId, fetchNext]);

  return { card, loading, error, rate };
}
