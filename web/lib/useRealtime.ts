"use client";
import { useEffect, useRef } from "react";

type NotificationType = "short" | "full";

export function useRealtimeRefresh(onNotify: () => void, types: NotificationType[] = ["short"]) {
  const onNotifyRef = useRef(onNotify);
  onNotifyRef.current = onNotify;

  useEffect(() => {
    function handler(e: Event) {
      try {
        onNotifyRef.current();
      } catch (err) {
        console.error("realtime refresh handler error", err);
      }
    }

    if (types.includes("short")) window.addEventListener("notification:short", handler);
    if (types.includes("full")) window.addEventListener("notification:full", handler);

    return () => {
      if (types.includes("short")) window.removeEventListener("notification:short", handler);
      if (types.includes("full")) window.removeEventListener("notification:full", handler);
    };
  }, [types]);
}

export default useRealtimeRefresh;
