import { useCallback, useEffect, useState } from "react";
import { getWsStatus } from "../lib/api";
import type { WsStatusPayload } from "../lib/schemas";

const DEFAULT_STATUS: WsStatusPayload = {
  connected: false,
  client_count: 0,
  port: 48123,
};

export const useWsBridgeStatus = () => {
  const [status, setStatus] = useState<WsStatusPayload>(DEFAULT_STATUS);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getWsStatus();
      setStatus(data);
    } catch {
      setStatus(DEFAULT_STATUS);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const data = await getWsStatus();
        if (isMounted) setStatus(data);
      } catch {
        if (isMounted) setStatus(DEFAULT_STATUS);
      }
    };

    void poll();
    const interval = setInterval(() => void poll(), 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    status,
    connected: status.connected,
    clientCount: status.client_count,
    port: status.port,
    refresh: fetchStatus,
  };
};
