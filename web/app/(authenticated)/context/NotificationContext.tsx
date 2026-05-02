"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";

type Handler = (detail: any) => void;

const NotificationContext = createContext({
  subscribeShort: (h: Handler) => { return () => {}; },
  subscribeFull: (h: Handler) => { return () => {}; },
  emitShort: (payload: any) => {},
  emitFull: (payload: any) => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const shortHandlers = useRef(new Set<Handler>());
  const fullHandlers = useRef(new Set<Handler>());

  useEffect(() => {
    const hShort = (e: any) => {
      const d = e?.detail;
      shortHandlers.current.forEach(fn => fn(d));
    };
    const hFull = (e: any) => {
      const d = e?.detail;
      fullHandlers.current.forEach(fn => fn(d));
    };

    window.addEventListener('notification:short', hShort as EventListener);
    window.addEventListener('notification:full', hFull as EventListener);

    return () => {
      window.removeEventListener('notification:short', hShort as EventListener);
      window.removeEventListener('notification:full', hFull as EventListener);
    };
  }, []);

  const subscribeShort = (h: Handler) => {
    shortHandlers.current.add(h);
    return () => shortHandlers.current.delete(h);
  };
  const subscribeFull = (h: Handler) => {
    fullHandlers.current.add(h);
    return () => fullHandlers.current.delete(h);
  };

  const emitShort = (payload: any) => {
    try { window.dispatchEvent(new CustomEvent('notification:short', { detail: payload })); } catch {}
  };
  const emitFull = (payload: any) => {
    try { window.dispatchEvent(new CustomEvent('notification:full', { detail: payload })); } catch {}
  };

  return (
    <NotificationContext.Provider value={{ subscribeShort, subscribeFull, emitShort, emitFull }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
