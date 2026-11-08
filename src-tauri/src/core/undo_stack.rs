use super::types::UndoItem;
use std::collections::VecDeque;
use std::sync::Mutex;

pub const MAX_UNDO_STACK_SIZE: usize = 5;

pub struct UndoStack {
    items: Mutex<VecDeque<UndoItem>>,
}

impl Default for UndoStack {
    fn default() -> Self {
        Self::new()
    }
}

impl UndoStack {
    pub fn new() -> Self {
        Self {
            items: Mutex::new(VecDeque::with_capacity(MAX_UNDO_STACK_SIZE)),
        }
    }

    pub fn push(&self, item: UndoItem) {
        if let Ok(mut lock) = self.items.lock() {
            if lock.len() >= MAX_UNDO_STACK_SIZE {
                lock.pop_front();
            }
            lock.push_back(item);
        }
    }

    pub fn pop(&self) -> Option<UndoItem> {
        if let Ok(mut lock) = self.items.lock() {
            lock.pop_back()
        } else {
            None
        }
    }

    pub fn len(&self) -> usize {
        if let Ok(lock) = self.items.lock() {
            lock.len()
        } else {
            0
        }
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }

    pub fn clear(&self) {
        if let Ok(mut lock) = self.items.lock() {
            lock.clear();
        }
    }
}
