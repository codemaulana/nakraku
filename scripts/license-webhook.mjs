import crypto from "node:crypto";
import { generateLicenseKey } from "./generate-license.mjs";

export function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const digest = hmac.digest("hex");
    const sigClean = signatureHeader.trim().toLowerCase();
    const digestBuf = Buffer.from(digest, "utf-8");
    const sigBuf = Buffer.from(sigClean, "utf-8");
    if (digestBuf.length !== sigBuf.length) return false;
    return crypto.timingSafeEqual(digestBuf, sigBuf);
  } catch {
    return false;
  }
}

export function processPurchaseEvent(eventData) {
  const eventName = eventData?.meta?.event_name || eventData?.type || "order_created";
  const customData =
    eventData?.data?.attributes?.first_order_item?.custom_data ||
    eventData?.data?.attributes?.custom_data ||
    eventData?.data?.metadata ||
    {};

  const machineId = customData?.machine_id || customData?.machineId;
  const userEmail =
    eventData?.data?.attributes?.user_email ||
    eventData?.data?.customer?.email ||
    "customer@example.com";

  if (!machineId) {
    return {
      success: false,
      error: "Missing machine_id in order custom data",
    };
  }

  const tier = (customData?.tier || "pro").toLowerCase();
  const generated = generateLicenseKey({ machineId, tier });

  return {
    success: true,
    eventName,
    email: userEmail,
    tier: generated.tier,
    machineId: generated.machineId,
    licenseKey: generated.licenseKey,
  };
}

export function webhookHandler(req, res, webhookSecret = "test_webhook_secret") {
  const signature = req.headers["x-signature"] || req.headers["polar-signature"];
  const rawBody = req.body || "";

  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: "Invalid webhook HMAC signature" }));
    return;
  }

  const event = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  const result = processPurchaseEvent(event);

  res.statusCode = result.success ? 200 : 400;
  res.end(JSON.stringify(result));
}
