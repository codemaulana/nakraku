import { useEffect } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useToast } from "../context/ToastContext";
import { AppErrorPayloadSchema } from "../lib/appError";

export const useAppErrorListener = () => {
  const toast = useToast();

  useEffect(() => {
    if (!isTauri()) return;

    let unlistenFn: (() => void) | undefined;

    const setupListener = async () => {
      try {
        unlistenFn = await listen<unknown>("app://error", (event) => {
          const parsed = AppErrorPayloadSchema.safeParse(event.payload);
          if (parsed.success) {
            toast.error(`[${parsed.data.type}] ${parsed.data.details}`);
          } else if (typeof event.payload === "string") {
            toast.error(event.payload);
          } else {
            toast.error("An unexpected system error occurred");
          }
        });
      } catch {
        // Listener initialization fallback
      }
    };

    void setupListener();

    return () => {
      if (unlistenFn) unlistenFn();
    };
  }, [toast]);
};
