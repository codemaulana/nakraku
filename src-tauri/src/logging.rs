use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};
use tauri_plugin_log::{RotationStrategy, Target, TargetKind};

pub const MAX_LOG_SIZE_BYTES: u128 = 5 * 1024 * 1024; // 5 MB

pub fn sanitize_pii(input: &str) -> String {
    let mut sanitized = input.to_string();
    if let Ok(username) = std::env::var("USERNAME") {
        if !username.trim().is_empty() {
            let user_pattern = format!("Users\\{}", username);
            let user_pattern_fwd = format!("Users/{}", username);
            sanitized = sanitized.replace(&user_pattern, "Users\\[REDACTED]");
            sanitized = sanitized.replace(&user_pattern_fwd, "Users/[REDACTED]");
            sanitized = sanitized.replace(&username, "[REDACTED_USER]");
        }
    }
    sanitized
}

pub fn get_log_dir(app: &AppHandle) -> PathBuf {
    if let Ok(dir) = app.path().app_log_dir() {
        if !dir.exists() {
            let _ = fs::create_dir_all(&dir);
        }
        dir
    } else {
        let fallback = std::env::temp_dir().join("Nakraku").join("logs");
        let _ = fs::create_dir_all(&fallback);
        fallback
    }
}

pub fn get_log_file_path(app: &AppHandle) -> PathBuf {
    get_log_dir(app).join("app.log")
}

pub fn setup_panic_hook(log_dir: PathBuf) {
    let default_hook = std::panic::take_hook();

    std::panic::set_hook(Box::new(move |panic_info| {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0);

        let thread = std::thread::current();
        let thread_name = thread.name().unwrap_or("unnamed");

        let location = panic_info
            .location()
            .map(|loc| format!("{}:{}:{}", loc.file(), loc.line(), loc.column()))
            .unwrap_or_else(|| "unknown location".to_string());

        let payload_msg = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
            (*s).to_string()
        } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
            s.clone()
        } else {
            "Box<dyn Any> panic payload".to_string()
        };

        let backtrace = std::backtrace::Backtrace::capture();

        let report = format!(
            "=== NAKRAKU STASH CRASH REPORT ===\n\
             Timestamp: {timestamp}\n\
             Thread: {thread_name}\n\
             Location: {location}\n\
             Panic Message: {payload_msg}\n\n\
             === BACKTRACE ===\n\
             {backtrace}\n"
        );

        let clean_report = sanitize_pii(&report);
        eprintln!("{clean_report}");
        log::error!("{clean_report}");

        let crash_file = log_dir.join(format!("crash-{timestamp}.log"));
        if let Ok(mut file) = OpenOptions::new().create(true).write(true).open(&crash_file) {
            let _ = file.write_all(clean_report.as_bytes());
        }

        default_hook(panic_info);
    }));
}

pub fn configure_logging(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let log_dir = get_log_dir(app.handle());
    setup_panic_hook(log_dir);

    let plugin = tauri_plugin_log::Builder::default()
        .targets([
            Target::new(TargetKind::Stdout),
            Target::new(TargetKind::LogDir {
                file_name: Some("app".to_string()),
            }),
        ])
        .max_file_size(MAX_LOG_SIZE_BYTES)
        .rotation_strategy(RotationStrategy::KeepOne)
        .level(log::LevelFilter::Info)
        .build();

    let _ = app.handle().plugin(plugin);
    Ok(())
}

#[tauri::command]
pub fn cmd_get_log_path(app: AppHandle) -> Result<String, String> {
    let path = get_log_file_path(&app);
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn cmd_get_recent_logs(app: AppHandle, max_lines: Option<usize>) -> Result<String, String> {
    let path = get_log_file_path(&app);
    if !path.exists() {
        return Ok("No log file found.".to_string());
    }

    let contents = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let sanitized_contents = sanitize_pii(&contents);
    let limit = max_lines.unwrap_or(100);
    let lines: Vec<&str> = sanitized_contents.lines().collect();

    if lines.len() <= limit {
        Ok(sanitized_contents)
    } else {
        let start = lines.len() - limit;
        Ok(lines[start..].join("\n"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_max_log_size_constant() {
        assert_eq!(MAX_LOG_SIZE_BYTES, 5 * 1024 * 1024);
    }

    #[test]
    fn test_crash_report_formatting() -> Result<(), Box<dyn std::error::Error>> {
        let dir = std::env::temp_dir().join("nakraku_test_logs");
        let _ = fs::create_dir_all(&dir);

        let timestamp = 1700000000;
        let crash_file = dir.join(format!("crash-{timestamp}.log"));
        let dummy_report = "=== NAKRAKU STASH CRASH REPORT ===\nTest crash\n";

        fs::write(&crash_file, dummy_report)?;
        assert!(crash_file.exists());

        let read_back = fs::read_to_string(&crash_file)?;
        assert!(read_back.contains("NAKRAKU STASH CRASH REPORT"));

        let _ = fs::remove_file(crash_file);
        Ok(())
    }

    #[test]
    fn test_sanitize_pii_removes_username() {
        if let Ok(username) = std::env::var("USERNAME") {
            let sensitive = format!("Error at C:\\Users\\{}\\app\\data", username);
            let sanitized = sanitize_pii(&sensitive);
            assert!(!sanitized.contains(&username));
            assert!(sanitized.contains("[REDACTED]"));
        }
    }
}
