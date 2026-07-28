import { buildApiUrl } from "@/shared/api/buildApiUrl";
import { getAccessToken, refreshAccessToken } from "@/shared/api/apiClient";

export type NotificationStreamEvent =
  | {
      type: "notification.created";
      notificationId: string;
      notificationType: string;
    }
  | {
      type: "heartbeat";
    };

type ConnectHandlers = {
  onEvent: (event: NotificationStreamEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: unknown) => void;
};

function parseSseChunk(chunk: string): NotificationStreamEvent | null {
  const dataLine = chunk
    .split("\n")
    .find((line) => line.startsWith("data:"));

  if (!dataLine) {
    return null;
  }

  const payload = dataLine.replace(/^data:\s?/, "").trim();

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(payload) as NotificationStreamEvent;
  } catch {
    return null;
  }
}

async function openNotificationStream(
  signal: AbortSignal,
  handlers: ConnectHandlers,
  retriedAuth = false,
): Promise<void> {
  const token = getAccessToken();

  const response = await fetch(buildApiUrl("/users/me/notifications/stream"), {
    method: "GET",
    headers: {
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    signal,
  });

  if (response.status === 401) {
    if (retriedAuth) {
      throw new Error("Authentication required for notification stream");
    }

    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      throw new Error("Authentication required for notification stream");
    }

    return openNotificationStream(signal, handlers, true);
  }

  if (!response.ok || !response.body) {
    throw new Error(`Notification stream failed: ${response.status}`);
  }

  handlers.onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");

    while (boundary !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const event = parseSseChunk(chunk);

      if (event && event.type !== "heartbeat") {
        handlers.onEvent(event);
      }

      boundary = buffer.indexOf("\n\n");
    }
  }
}

const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 30_000;

export function connectNotificationStream(handlers: ConnectHandlers): () => void {
  const abortController = new AbortController();
  let reconnectAttempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const scheduleReconnect = () => {
    if (stopped) {
      return;
    }

    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempt,
      RECONNECT_MAX_MS,
    );
    reconnectAttempt += 1;

    reconnectTimer = setTimeout(() => {
      void run();
    }, delay);
  };

  const run = async () => {
    try {
      await openNotificationStream(abortController.signal, {
        ...handlers,
        onOpen: () => {
          reconnectAttempt = 0;
          handlers.onOpen?.();
        },
      });

      handlers.onClose?.();

      if (!stopped) {
        scheduleReconnect();
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        return;
      }

      handlers.onError?.(error);
      handlers.onClose?.();
      scheduleReconnect();
    }
  };

  void run();

  return () => {
    stopped = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }

    abortController.abort();
    handlers.onClose?.();
  };
}
