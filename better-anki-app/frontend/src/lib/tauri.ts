import { invoke } from "@tauri-apps/api/core";

export interface ProfileInfo {
  name: string;
  collection_path: string;
}

export interface DeckSummary {
  id: number;
  name: string;
  new_count: number;
  learn_count: number;
  review_count: number;
  filtered: boolean;
}

export interface CardForReview {
  card_id: number;
  question: string;
  answer: string;
  css: string;
  new_count: number;
  learning_count: number;
  review_count: number;
}

export const detectAnkiProfiles = () => invoke<ProfileInfo[]>("detect_anki_profiles");
export const openCollection = (collectionPath: string) =>
  invoke<void>("open_collection", { collectionPath });
export const closeCollection = () => invoke<void>("close_collection");
export const getDecks = () => invoke<DeckSummary[]>("get_decks");
export const setCurrentDeck = (deckId: number) =>
  invoke<void>("set_current_deck", { deckId });
export const getNextCard = () => invoke<CardForReview | null>("get_next_card");
export const answerCard = (
  cardId: number,
  rating: number,
  millisecondsTaken: number
) => invoke<void>("answer_card", { cardId, rating, millisecondsTaken });
