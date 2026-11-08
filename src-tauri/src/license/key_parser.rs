use super::error::LicenseError;
use super::types::LicensePayload;
use base64::engine::general_purpose::{URL_SAFE, URL_SAFE_NO_PAD};
use base64::Engine;

pub struct ParsedLicenseKey {
    pub payload: LicensePayload,
    pub canonical_text: String,
    pub signature_bytes: [u8; 64],
}

fn decode_b64url(input: &str) -> Result<Vec<u8>, LicenseError> {
    let trimmed = input.trim();
    if let Ok(bytes) = URL_SAFE_NO_PAD.decode(trimmed) {
        return Ok(bytes);
    }
    URL_SAFE
        .decode(trimmed)
        .map_err(|e| LicenseError::InvalidBase64(e.to_string()))
}

pub fn parse_license_key(key_str: &str) -> Result<ParsedLicenseKey, LicenseError> {
    let clean = key_str.trim();
    let normalized = if let Some(stripped) = clean.strip_prefix("NAKRAKU-") {
        format!("NAKRAKU.{}", stripped)
    } else {
        clean.to_string()
    };

    let parts: Vec<&str> = normalized.split('.').collect();

    if parts.len() != 3 {
        return Err(LicenseError::InvalidFormat(
            "Expected format NAKRAKU.<PAYLOAD>.<SIGNATURE>".into(),
        ));
    }

    if !parts[0].eq_ignore_ascii_case("NAKRAKU") {
        return Err(LicenseError::InvalidFormat(
            "License key must start with NAKRAKU prefix".into(),
        ));
    }

    let payload_bytes = decode_b64url(parts[1])?;
    let canonical_text = String::from_utf8(payload_bytes)
        .map_err(|e| LicenseError::InvalidFormat(format!("Non-UTF8 payload: {}", e)))?;

    let sig_vec = decode_b64url(parts[2])?;
    if sig_vec.len() != 64 {
        return Err(LicenseError::InvalidFormat(format!(
            "Expected 64-byte signature, got {} bytes",
            sig_vec.len()
        )));
    }

    let mut signature_bytes = [0u8; 64];
    signature_bytes.copy_from_slice(&sig_vec);

    let can_parts: Vec<&str> = canonical_text.split(':').collect();
    if can_parts.len() != 5 || can_parts[0] != "nakraku" || can_parts[1] != "v1" {
        return Err(LicenseError::InvalidFormat(
            "Canonical payload missing nakraku:v1 structure".into(),
        ));
    }

    let tier = can_parts[2].to_lowercase();
    let machine_id = can_parts[3].to_lowercase();
    let expires_at = can_parts[4]
        .parse::<i64>()
        .map_err(|_| LicenseError::InvalidFormat("Invalid expiration integer".into()))?;

    let payload = LicensePayload {
        tier,
        machine_id,
        expires_at,
    };

    Ok(ParsedLicenseKey {
        payload,
        canonical_text,
        signature_bytes,
    })
}
