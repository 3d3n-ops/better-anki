use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};

use anki::collection::CollectionBuilder;
use anki_i18n::I18n;
use dirs::data_dir;
use rusqlite::{Connection, OpenFlags};
use serde::Serialize;
use tauri::State;

use crate::state::AppState;

#[derive(Debug, Serialize)]
pub struct ProfileInfo {
    pub name: String,
    pub collection_path: String,
}

fn anki2_base_dir() -> Option<PathBuf> {
    let mut base = data_dir()?;

    // All desktop platforms use an "Anki2" directory under the standard data dir.
    base.push("Anki2");
    Some(base)
}

fn collect_profiles() -> Result<Vec<ProfileInfo>, String> {
    let base = match anki2_base_dir() {
        Some(path) => path,
        None => return Ok(Vec::new()),
    };

    let entries = match fs::read_dir(&base) {
        Ok(entries) => entries,
        Err(err) => {
            // If the directory does not exist yet, treat as no profiles.
            if err.kind() == std::io::ErrorKind::NotFound {
                return Ok(Vec::new());
            }
            return Err(err.to_string());
        }
    };

    let mut profiles = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        if !entry.file_type().map_err(|e| e.to_string())?.is_dir() {
            continue;
        }

        let name = entry
            .file_name()
            .to_string_lossy()
            .trim()
            .to_string();

        if name.is_empty() {
            continue;
        }

        let col_path = entry.path().join("collection.anki2");
        if col_path.is_file() {
            profiles.push(ProfileInfo {
                name,
                collection_path: col_path.to_string_lossy().into_owned(),
            });
        }
    }

    Ok(profiles)
}

fn wal_path(path: &Path) -> Option<PathBuf> {
    let file_name = path.file_name().and_then(OsStr::to_str)?;
    let mut wal_name = String::from(file_name);
    wal_name.push_str("-wal");
    Some(path.with_file_name(wal_name))
}

fn ensure_collection_not_locked(path: &Path) -> Result<(), String> {
    if let Some(wal) = wal_path(path) {
        if wal.exists() {
            return Err("ERR_COLLECTION_LOCKED".to_string());
        }
    }

    // Try to acquire an exclusive lock using a short-lived connection.
    let conn = Connection::open_with_flags(
        path,
        OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_NO_MUTEX,
    )
    .map_err(|e| e.to_string())?;

    if let Err(err) = conn.execute("PRAGMA busy_timeout = 0;", []) {
        return Err(err.to_string());
    }

    if let Err(err) = conn.execute("BEGIN EXCLUSIVE TRANSACTION;", []) {
        let msg = err.to_string();
        if msg.to_lowercase().contains("database is locked") {
            return Err("ERR_COLLECTION_LOCKED".to_string());
        }
        return Err(msg);
    }

    // If we got here, we successfully acquired an exclusive lock.
    let _ = conn.execute("ROLLBACK;", []);
    Ok(())
}

fn open_collection_at(path: &Path) -> Result<anki::collection::Collection, String> {
    ensure_collection_not_locked(path)?;

    let mut builder = CollectionBuilder::new(path.to_path_buf());
    builder
        .with_desktop_media_paths()
        .set_tr(I18n::template_only());

    builder.build().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn detect_anki_profiles() -> Result<Vec<ProfileInfo>, String> {
    collect_profiles()
}

#[tauri::command]
pub async fn open_collection(
    collection_path: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let path = PathBuf::from(collection_path);
    if !path.is_file() {
        return Err("Collection file does not exist".to_string());
    }

    let collection = open_collection_at(&path)?;

    {
        let mut guard = state.collection.lock().map_err(|_| "Lock poisoned".to_string())?;
        if guard.is_some() {
            return Err("Collection already open".to_string());
        }
        *guard = Some(collection);
    }

    Ok(())
}

#[tauri::command]
pub async fn close_collection(state: State<'_, AppState>) -> Result<(), String> {
    let mut guard = state.collection.lock().map_err(|_| "Lock poisoned".to_string())?;
    if let Some(col) = guard.take() {
        col.close(None).map_err(|e| e.to_string())?;
    }
    Ok(())
}

