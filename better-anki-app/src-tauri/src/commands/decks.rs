use std::sync::MutexGuard;

use anki::prelude::*;
use anki::timestamp::TimestampSecs;
use anki_proto::decks::DeckTreeNode;
use serde::Serialize;
use tauri::State;

use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
pub struct DeckSummary {
    pub id: i64,
    pub name: String,
    pub new_count: u32,
    pub learn_count: u32,
    pub review_count: u32,
    pub filtered: bool,
}

fn flatten_deck_tree(node: &DeckTreeNode, parent_name: &str, out: &mut Vec<DeckSummary>) {
    let full_name = if parent_name.is_empty() {
        node.name.clone()
    } else {
        format!("{}::{}", parent_name, node.name)
    };

    // Skip the root node (deck_id 0) and filtered decks for the simple deck list
    if node.deck_id != 0 && !node.filtered {
        out.push(DeckSummary {
            id: node.deck_id,
            name: full_name.clone(),
            new_count: node.new_count,
            learn_count: node.learn_count,
            review_count: node.review_count,
            filtered: node.filtered,
        });
    }

    for child in &node.children {
        flatten_deck_tree(child, &full_name, out);
    }
}

fn lock_collection(state: &AppState) -> Result<MutexGuard<'_, Option<anki::collection::Collection>>, String> {
    let guard = state.collection.lock().map_err(|_| "Lock poisoned".to_string())?;
    if guard.is_none() {
        return Err("No collection open".to_string());
    }
    Ok(guard)
}

#[tauri::command]
pub async fn get_decks(state: State<'_, AppState>) -> Result<Vec<DeckSummary>, String> {
    let mut guard = lock_collection(&state)?;
    let col = guard.as_mut().unwrap();

    let now = TimestampSecs::now();
    let tree = col.deck_tree(Some(now.into())).map_err(|e| e.to_string())?;

    let mut decks = Vec::new();
    flatten_deck_tree(&tree, "", &mut decks);
    Ok(decks)
}

#[tauri::command]
pub async fn set_current_deck(deck_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = lock_collection(&state)?;
    let col = guard.as_mut().unwrap();

    col.set_current_deck(DeckId(deck_id)).map_err(|e| e.to_string())?;
    Ok(())
}
