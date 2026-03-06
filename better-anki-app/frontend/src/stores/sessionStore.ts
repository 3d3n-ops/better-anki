import { create } from "zustand";
import type { CardForReview } from "@/lib/tauri";

type SessionState =
  | { status: "idle" }
  | { status: "picking_deck" }
  | { status: "studying"; deckId: number; deckName: string }
  | { status: "finished"; deckId: number; deckName: string; correct: number; again: number; total: number };

interface SessionStore {
  state: SessionState;
  currentCard: CardForReview | null;
  isFlipped: boolean;
  startSession: (deckId: number, deckName: string) => void;
  setCurrentCard: (card: CardForReview | null) => void;
  flip: () => void;
  rateAndNext: (rating: number) => void;
  finishSession: (correct: number, again: number, total: number) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  state: { status: "idle" },
  currentCard: null,
  isFlipped: false,

  startSession: (deckId, deckName) =>
    set({
      state: { status: "studying", deckId, deckName },
      currentCard: null,
      isFlipped: false,
    }),

  setCurrentCard: (card) =>
    set({ currentCard: card, isFlipped: false }),

  flip: () => set((s) => ({ ...s, isFlipped: !s.isFlipped })),

  rateAndNext: () => {
    // Actual rating is handled by CardSwipe/StudySession via answer_card
    set({ currentCard: null, isFlipped: false });
  },

  finishSession: (correct, again, total) => {
    const s = get().state;
    if (s.status === "studying")
      set({
        state: { status: "finished", deckId: s.deckId, deckName: s.deckName, correct, again, total },
        currentCard: null,
      });
  },

  reset: () =>
    set({
      state: { status: "idle" },
      currentCard: null,
      isFlipped: false,
    }),
}));
