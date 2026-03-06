use std::sync::Mutex;

use anki::collection::Collection;

#[derive(Default)]
pub struct UserPrefs {
    pub last_profile: Option<String>,
}

pub struct AppState {
    pub collection: Mutex<Option<Collection>>,
    pub prefs: Mutex<UserPrefs>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            collection: Mutex::new(None),
            prefs: Mutex::new(UserPrefs::default()),
        }
    }
}

