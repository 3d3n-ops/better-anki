import { useState, useEffect, useCallback } from "react";
import { getDecks, setCurrentDeck, type DeckSummary } from "@/lib/tauri";

export function useDecks() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getDecks();
      setDecks(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectDeckForStudy = useCallback(async (deckId: number) => {
    setError(null);
    try {
      await setCurrentDeck(deckId);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }, []);

  return { decks, loading, error, refresh, selectDeckForStudy };
}
