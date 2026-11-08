use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager, Monitor, PhysicalPosition, PhysicalSize, WebviewWindow};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowGeometry {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub is_maximized: bool,
}

impl Default for WindowGeometry {
    fn default() -> Self {
        Self {
            x: 100,
            y: 100,
            width: 900,
            height: 600,
            is_maximized: false,
        }
    }
}

pub fn clamp_to_monitors(
    geo: &WindowGeometry,
    monitors: &[Monitor],
) -> (PhysicalPosition<i32>, PhysicalSize<u32>) {
    let fallback_width = geo.width.max(720);
    let fallback_height = geo.height.max(480);

    for m in monitors {
        let pos = m.position();
        let size = m.size();
        let m_x = pos.x;
        let m_y = pos.y;
        let m_w = size.width as i32;
        let m_h = size.height as i32;

        if geo.x >= m_x && geo.x < m_x + m_w && geo.y >= m_y && geo.y < m_y + m_h {
            let clamped_x = geo.x.clamp(m_x, (m_x + m_w - 100).max(m_x));
            let clamped_y = geo.y.clamp(m_y, (m_y + m_h - 100).max(m_y));
            let clamped_w = (geo.width as i32).min(m_w).max(720) as u32;
            let clamped_h = (geo.height as i32).min(m_h).max(480) as u32;
            return (
                PhysicalPosition::new(clamped_x, clamped_y),
                PhysicalSize::new(clamped_w, clamped_h),
            );
        }
    }

    (
        PhysicalPosition::new(100, 100),
        PhysicalSize::new(fallback_width, fallback_height),
    )
}

fn get_config_path(app: &AppHandle) -> Option<PathBuf> {
    app.path().app_data_dir().ok().map(|p| p.join("window_state.json"))
}

pub fn save_window_state(window: &WebviewWindow) -> Result<(), String> {
    let app = window.app_handle();
    let path = match get_config_path(app) {
        Some(p) => p,
        None => return Ok(()),
    };

    let pos = window.outer_position().map_err(|e| e.to_string())?;
    let size = window.outer_size().map_err(|e| e.to_string())?;
    let is_max = window.is_maximized().unwrap_or(false);

    let state = WindowGeometry {
        x: pos.x,
        y: pos.y,
        width: size.width,
        height: size.height,
        is_maximized: is_max,
    };

    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let json = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn restore_window_state(window: &WebviewWindow) -> Result<(), String> {
    let app = window.app_handle();
    let path = match get_config_path(app) {
        Some(p) => p,
        None => return Ok(()),
    };

    if !path.exists() {
        return Ok(());
    }

    let contents = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let geo: WindowGeometry = match serde_json::from_str(&contents) {
        Ok(g) => g,
        Err(_) => return Ok(()),
    };

    let monitors = window.available_monitors().unwrap_or_default();
    let (clamped_pos, clamped_size) = clamp_to_monitors(&geo, &monitors);

    let _ = window.set_size(clamped_size);
    let _ = window.set_position(clamped_pos);
    if geo.is_maximized {
        let _ = window.maximize();
    }

    Ok(())
}
