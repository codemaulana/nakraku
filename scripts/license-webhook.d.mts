export function verifyWebhookSignature(
  payload: string | Record<string, unknown>,
  signature: string,
  secret?: string
): boolean;

export interface ProcessPurchaseResult {
  success: boolean;
  eventName?: string;
  email?: string;
  tier?: string;
  machineId?: string;
  licenseKey?: string;
  reason?: string;
  error?: string;
}

export function processPurchaseEvent(
  event: Record<string, unknown>
): ProcessPurchaseResult;

export function webhookHandler(
  req: {
    headers: Record<string, string | undefined>;
    body?: string | Record<string, unknown>;
  },
  res: {
    statusCode: number;
    end: (payload: string) => void;
  },
  webhookSecret?: string
): void;
