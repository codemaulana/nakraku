use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LicensePayload {
    pub tier: String,
    pub machine_id: String,
    pub expires_at: i64,
}

impl LicensePayload {
    pub fn to_canonical_string(&self) -> String {
        format!("nakraku:v1:{}:{}:{}", self.tier, self.machine_id, self.expires_at)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct LicenseStatus {
    pub valid: bool,
    pub tier: String,
    pub machine_id: String,
    pub expires_at: Option<i64>,
    pub is_pro: bool,
}

impl LicenseStatus {
    pub fn free(machine_id: String) -> Self {
        Self {
            valid: false,
            tier: "free".to_string(),
            machine_id,
            expires_at: None,
            is_pro: false,
        }
    }
}
