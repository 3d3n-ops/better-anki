use std::sync::MutexGuard;

use anki::prelude::*;
use anki::scheduler::answering::{CardAnswer, Rating};
use anki::timestamp::TimestampMillis;
use anki::template::RenderedNode;
use serde::Serialize;
use tauri::State;

use crate::state::AppState;

fn nodes_to_html(nodes: &[RenderedNode]) -> String {
    nodes
        .iter()
        .map(|n| match n {
            RenderedNode::Text { text } => text.as_str(),
            RenderedNode::Replacement { current_text, .. } => current_text.as_str(),
        })
        .collect()
}

#[derive(Debug, Clone, Serialize)]
pub struct CardForReview {
    pub card_id: i64,
    pub question: String,
    pub answer: String,
    pub css: String,
    pub new_count: usize,
    pub learning_count: usize,
    pub review_count: usize,
}

fn lock_collection(state: &AppState) -> Result<MutexGuard<'_, Option<anki::collection::Collection>>, String> {
    let guard = state.collection.lock().map_err(|_| "Lock poisoned".to_string())?;
    if guard.is_none() {
        return Err("No collection open".to_string());
    }
    Ok(guard)
}

#[tauri::command]
pub async fn get_next_card(state: State<'_, AppState>) -> Result<Option<CardForReview>, String> {
    let mut guard = lock_collection(&state)?;
    let col = guard.as_mut().unwrap();

    let queued = col.get_queued_cards(1, false).map_err(|e| e.to_string())?;
    let Some(qcard) = queued.cards.first() else {
        return Ok(None);
    };

    let out = col
        .render_existing_card(qcard.card.id, false, false)
        .map_err(|e| e.to_string())?;

    let question = nodes_to_html(&out.qnodes);
    let answer = nodes_to_html(&out.anodes);

    Ok(Some(CardForReview {
        card_id: qcard.card.id.0,
        question,
        answer,
        css: out.css,
        new_count: queued.new_count,
        learning_count: queued.learning_count,
        review_count: queued.review_count,
    }))
}

/// Rate: 1=Again, 2=Hard, 3=Good, 4=Easy
#[tauri::command]
pub async fn answer_card(
    card_id: i64,
    rating: u8,
    milliseconds_taken: u32,
    state: State<'_, AppState>,
) -> Result<(), String> {
    if !(1..=4).contains(&rating) {
        return Err("Rating must be 1-4".to_string());
    }

    let mut guard = lock_collection(&state)?;
    let col = guard.as_mut().unwrap();

    let states = col.get_scheduling_states(CardId(card_id)).map_err(|e| e.to_string())?;

    let new_state = match rating {
        1 => states.again,
        2 => states.hard,
        3 => states.good,
        _ => states.easy,
    };

    let mut answer = CardAnswer {
        card_id: CardId(card_id),
        current_state: states.current,
        new_state,
        rating: match rating {
            1 => Rating::Again,
            2 => Rating::Hard,
            3 => Rating::Good,
            _ => Rating::Easy,
        },
        answered_at: TimestampMillis::now(),
        milliseconds_taken,
        custom_data: None,
        from_queue: true,
    };

    col.answer_card(&mut answer).map_err(|e| e.to_string())?;
    Ok(())
}
