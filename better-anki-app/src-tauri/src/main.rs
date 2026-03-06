#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use commands::collection::{close_collection, detect_anki_profiles, open_collection};
use commands::decks::{get_decks, set_current_deck};
use commands::study::{answer_card, get_next_card};
use state::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            detect_anki_profiles,
            open_collection,
            close_collection,
            get_decks,
            set_current_deck,
            get_next_card,
            answer_card,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Better Anki");
}

