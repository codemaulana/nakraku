use super::types::{SessionDiff, WindowMoveDiff};
use crate::os::types::RawWindow;

pub fn diff_sessions(base: &[RawWindow], current: &[RawWindow]) -> SessionDiff {
    let mut added_windows = Vec::new();
    let mut removed_windows = Vec::new();
    let mut moved_windows = Vec::new();
    let mut unchanged_count = 0;

    let mut matched_current_indices = vec![false; current.len()];

    for b in base {
        let mut found_index = None;

        for (idx, c) in current.iter().enumerate() {
            if matched_current_indices[idx] {
                continue;
            }

            let matches_hwnd = !b.hwnd.is_empty() && b.hwnd == c.hwnd;
            let matches_identity = b.process_name.eq_ignore_ascii_case(&c.process_name)
                && b.title == c.title;

            if matches_hwnd || matches_identity {
                found_index = Some(idx);
                break;
            }
        }

        match found_index {
            Some(idx) => {
                matched_current_indices[idx] = true;
                let c = &current[idx];

                if b.rect.x != c.rect.x || b.rect.y != c.rect.y {
                    moved_windows.push(WindowMoveDiff {
                        process_name: c.process_name.clone(),
                        title: c.title.clone(),
                        old_x: b.rect.x,
                        old_y: b.rect.y,
                        new_x: c.rect.x,
                        new_y: c.rect.y,
                    });
                } else {
                    unchanged_count += 1;
                }
            }
            None => {
                removed_windows.push(b.clone());
            }
        }
    }

    for (idx, c) in current.iter().enumerate() {
        if !matched_current_indices[idx] {
            added_windows.push(c.clone());
        }
    }

    SessionDiff {
        added_windows,
        removed_windows,
        moved_windows,
        unchanged_count,
    }
}
