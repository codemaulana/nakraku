pub mod commands;
pub mod error;
pub mod key_parser;
pub mod machine_id;
pub mod store;
pub mod types;
pub mod verifier;

pub use error::LicenseError;
pub use machine_id::get_machine_id;
pub use types::{LicensePayload, LicenseStatus};
pub use verifier::{verify_license_offline, LICENSE_PUBLIC_KEY_HEX};

#[cfg(test)]
mod tests {
    use super::key_parser::parse_license_key;
    use super::machine_id::get_machine_id;
    use super::verifier::{decode_public_key_hex, verify_license_offline, LICENSE_PUBLIC_KEY_HEX};
    use base64::engine::general_purpose::URL_SAFE_NO_PAD;
    use base64::Engine;
    use ed25519_dalek::{Signer, SigningKey};

    const TEST_PRIV_KEY_HEX: &str =
        "f94f2437fe3a53be11cd1ceae0318453e1c2eca349b7c2e45a5f08cd4e480e31";

    fn create_test_license_key(
        tier: &str,
        machine_id: &str,
        expires_at: i64,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let canonical = format!("nakraku:v1:{}:{}:{}", tier, machine_id, expires_at);
        let priv_bytes = decode_public_key_hex(TEST_PRIV_KEY_HEX)?;
        let signing_key = SigningKey::from_bytes(&priv_bytes);
        let signature = signing_key.sign(canonical.as_bytes());

        let payload_b64 = URL_SAFE_NO_PAD.encode(canonical.as_bytes());
        let sig_b64 = URL_SAFE_NO_PAD.encode(signature.to_bytes());

        Ok(format!("NAKRAKU.{}.{}", payload_b64, sig_b64))
    }

    #[test]
    fn test_machine_id_format_and_stability() {
        let id1 = get_machine_id();
        let id2 = get_machine_id();
        assert_eq!(id1, id2);
        assert_eq!(id1.len(), 64);
        assert!(id1.chars().all(|c| c.is_ascii_hexdigit()));
    }

    #[test]
    fn test_license_validation_valid_key() -> Result<(), Box<dyn std::error::Error>> {
        let mid = get_machine_id();
        let key = create_test_license_key("pro", &mid, 0)?;

        let status = verify_license_offline(&key, &mid, LICENSE_PUBLIC_KEY_HEX)?;
        assert!(status.valid);
        assert!(status.is_pro);
        assert_eq!(status.tier, "pro");
        assert_eq!(status.machine_id, mid);
        assert_eq!(status.expires_at, None);
        Ok(())
    }

    #[test]
    fn test_license_validation_tampered_key() -> Result<(), Box<dyn std::error::Error>> {
        let mid = get_machine_id();
        let key = create_test_license_key("pro", &mid, 0)?;
        let parsed = parse_license_key(&key)?;

        let mut tampered_sig = parsed.signature_bytes;
        tampered_sig[0] ^= 0xFF;
        let tampered_sig_b64 = URL_SAFE_NO_PAD.encode(tampered_sig);
        let parts: Vec<&str> = key.split('.').collect();
        let tampered_key = format!("NAKRAKU.{}.{}", parts[1], tampered_sig_b64);

        let result = verify_license_offline(&tampered_key, &mid, LICENSE_PUBLIC_KEY_HEX);
        assert!(result.is_err());
        Ok(())
    }

    #[test]
    fn test_license_validation_wrong_machine() -> Result<(), Box<dyn std::error::Error>> {
        let fake_mid = "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
        let key = create_test_license_key("pro", fake_mid, 0)?;

        let actual_mid = get_machine_id();
        let result = verify_license_offline(&key, &actual_mid, LICENSE_PUBLIC_KEY_HEX);
        assert!(result.is_err());
        Ok(())
    }

    #[test]
    fn test_license_validation_expired_key() -> Result<(), Box<dyn std::error::Error>> {
        let mid = get_machine_id();
        let past_timestamp = 1500000000;
        let key = create_test_license_key("pro", &mid, past_timestamp)?;

        let result = verify_license_offline(&key, &mid, LICENSE_PUBLIC_KEY_HEX);
        assert!(result.is_err());
        Ok(())
    }
}
