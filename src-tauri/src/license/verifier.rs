use super::error::LicenseError;
use super::key_parser::parse_license_key;
use super::types::LicenseStatus;
use ed25519_dalek::{Signature, VerifyingKey};

pub const LICENSE_PUBLIC_KEY_HEX: &str =
    "209702a69303341e793f87e0c76d77b7d1c333f28cde909b84109f47dada6493";

pub fn decode_public_key_hex(hex_str: &str) -> Result<[u8; 32], LicenseError> {
    if hex_str.len() != 64 {
        return Err(LicenseError::InvalidFormat("Public key hex length must be 64 characters".into()));
    }

    let mut bytes = [0u8; 32];
    for (i, byte) in bytes.iter_mut().enumerate() {
        let chunk = &hex_str[i * 2..i * 2 + 2];
        *byte = u8::from_str_radix(chunk, 16)
            .map_err(|e| LicenseError::InvalidFormat(format!("Hex parse error: {}", e)))?;
    }
    Ok(bytes)
}

pub fn verify_license_offline(
    license_key: &str,
    current_machine_id: &str,
    public_key_hex: &str,
) -> Result<LicenseStatus, LicenseError> {
    let parsed = parse_license_key(license_key)?;

    if !parsed.payload.machine_id.eq_ignore_ascii_case(current_machine_id) {
        return Err(LicenseError::MachineIdMismatch {
            expected: parsed.payload.machine_id,
            actual: current_machine_id.to_string(),
        });
    }

    let now_secs = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);

    if parsed.payload.expires_at > 0 && parsed.payload.expires_at < now_secs {
        return Err(LicenseError::Expired {
            expires_at: parsed.payload.expires_at,
            current_time: now_secs,
        });
    }

    let pub_key_bytes = decode_public_key_hex(public_key_hex)?;
    let verifying_key = VerifyingKey::from_bytes(&pub_key_bytes)
        .map_err(|_| LicenseError::InvalidFormat("Malformed Ed25519 public key bytes".into()))?;

    let signature = Signature::from_bytes(&parsed.signature_bytes);
    verifying_key
        .verify_strict(parsed.canonical_text.as_bytes(), &signature)
        .map_err(|_| LicenseError::InvalidSignature)?;

    let is_pro = parsed.payload.tier == "pro" || parsed.payload.tier == "lifetime" || parsed.payload.tier == "team";

    Ok(LicenseStatus {
        valid: true,
        tier: parsed.payload.tier,
        machine_id: current_machine_id.to_string(),
        expires_at: if parsed.payload.expires_at > 0 {
            Some(parsed.payload.expires_at)
        } else {
            None
        },
        is_pro,
    })
}
