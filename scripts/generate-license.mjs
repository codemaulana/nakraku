import crypto from "node:crypto";
import process from "node:process";

export const DEFAULT_MASTER_PUB_HEX =
  "209702a69303341e793f87e0c76d77b7d1c333f28cde909b84109f47dada6493";

export const DEFAULT_MASTER_PRIV_HEX =
  "f94f2437fe3a53be11cd1ceae0318453e1c2eca349b7c2e45a5f08cd4e480e31";

export function createPrivateKeyFromRawHex(hex) {
  const pkcs8Prefix = Buffer.from("302e020100300506032b657004220420", "hex");
  const der = Buffer.concat([pkcs8Prefix, Buffer.from(hex, "hex")]);
  return crypto.createPrivateKey({ key: der, format: "der", type: "pkcs8" });
}

export function createPublicKeyFromRawHex(hex) {
  const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
  const der = Buffer.concat([spkiPrefix, Buffer.from(hex, "hex")]);
  return crypto.createPublicKey({ key: der, format: "der", type: "spki" });
}

export function generateLicenseKey({
  machineId,
  tier = "pro",
  days = 0,
  privateKeyHex = DEFAULT_MASTER_PRIV_HEX,
}) {
  if (!machineId || typeof machineId !== "string" || machineId.trim().length !== 64) {
    throw new Error("machineId must be a 64-character hex string");
  }

  const cleanMid = machineId.trim().toLowerCase();
  const expiresAt = days === 0 ? 0 : Math.floor(Date.now() / 1000) + days * 86400;
  const canonical = `nakraku:v1:${tier.toLowerCase()}:${cleanMid}:${expiresAt}`;

  const privateKey = createPrivateKeyFromRawHex(privateKeyHex);
  const signature = crypto.sign(null, Buffer.from(canonical, "utf-8"), privateKey);

  const payloadB64 = Buffer.from(canonical, "utf-8").toString("base64url");
  const signatureB64 = Buffer.from(signature).toString("base64url");

  const licenseKey = `NAKRAKU.${payloadB64}.${signatureB64}`;

  return {
    licenseKey,
    canonical,
    tier,
    machineId: cleanMid,
    expiresAt,
  };
}

export function verifyLicenseKeyOffline(licenseKey, expectedMachineId, publicKeyHex = DEFAULT_MASTER_PUB_HEX) {
  const clean = licenseKey.trim();
  const normalized = clean.startsWith("NAKRAKU-")
    ? `NAKRAKU.${clean.slice(8)}`
    : clean;

  const parts = normalized.split(".");
  if (parts.length !== 3 || parts[0] !== "NAKRAKU") {
    return { valid: false, error: "Invalid key format" };
  }

  const payloadBuf = Buffer.from(parts[1], "base64url");
  const canonical = payloadBuf.toString("utf-8");
  const signatureBuf = Buffer.from(parts[2], "base64url");

  const canParts = canonical.split(":");
  if (canParts.length !== 5 || canParts[0] !== "nakraku" || canParts[1] !== "v1") {
    return { valid: false, error: "Invalid canonical payload" };
  }

  const [, , tier, machineId, expiresAtStr] = canParts;
  if (expectedMachineId && machineId.toLowerCase() !== expectedMachineId.toLowerCase()) {
    return { valid: false, error: "Machine ID mismatch" };
  }

  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt > 0 && expiresAt < now) {
    return { valid: false, error: "License expired" };
  }

  const pubKey = createPublicKeyFromRawHex(publicKeyHex);
  const verified = crypto.verify(null, Buffer.from(canonical, "utf-8"), pubKey, signatureBuf);

  return {
    valid: verified,
    tier,
    machineId,
    expiresAt: expiresAt > 0 ? expiresAt : null,
  };
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const params = { tier: "pro", days: 0 };

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--machine-id" && args[i + 1]) {
      params.machineId = args[i + 1];
      i += 1;
    } else if (args[i] === "--tier" && args[i + 1]) {
      params.tier = args[i + 1];
      i += 1;
    } else if (args[i] === "--days" && args[i + 1]) {
      params.days = parseInt(args[i + 1], 10);
      i += 1;
    } else if (args[i] === "--demo") {
      params.machineId = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
    }
  }

  return params;
}

if (process.argv[1] && process.argv[1].endsWith("generate-license.mjs")) {
  const cliParams = parseCliArgs();
  if (!cliParams.machineId) {
    console.log("Usage: node scripts/generate-license.mjs --machine-id <64-hex> [--tier pro|lifetime|team] [--days 365] [--demo]");
    process.exit(0);
  }

  const res = generateLicenseKey(cliParams);
  console.log("Generated Nakraku Stash License Key:");
  console.log(res.licenseKey);
  console.log("\nDetails:");
  console.log(`- Tier: ${res.tier}`);
  console.log(`- Machine ID: ${res.machineId}`);
  console.log(`- Expiry: ${res.expiresAt === 0 ? "Lifetime (Perpetual)" : new Date(res.expiresAt * 1000).toISOString()}`);
}
