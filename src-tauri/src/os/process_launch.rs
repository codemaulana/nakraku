use super::error::OsError;
use std::path::Path;
use std::process::Command;

pub fn launch_process(exe_path: &str, args: &[&str]) -> Result<u32, OsError> {
    let path = Path::new(exe_path);
    if !path.exists() {
        return Err(OsError::LaunchFailed(
            exe_path.to_string(),
            "Executable file does not exist".to_string(),
        ));
    }

    let mut cmd = Command::new(exe_path);
    for arg in args {
        cmd.arg(arg);
    }

    match cmd.spawn() {
        Ok(child) => Ok(child.id()),
        Err(err) => {
            let err_msg = err.to_string();
            if err.raw_os_error() == Some(740) {
                Err(OsError::ElevationRequired(exe_path.to_string()))
            } else {
                Err(OsError::LaunchFailed(exe_path.to_string(), err_msg))
            }
        }
    }
}
