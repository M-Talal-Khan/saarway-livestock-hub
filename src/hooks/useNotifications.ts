"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export interface ERPNotification {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  persistent: boolean;
  createdAt: string;
}

const POLL_INTERVAL = 60_000; // 60 seconds

function localDismissKey(farmId: string) {
  return `erp_dismissed_ephemeral_${farmId}`;
}
function localReadKey(farmId: string) {
  return `erp_read_ephemeral_${farmId}`;
}

function getLocalSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveLocalSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch { }
}

export function useNotifications() {
  const { currentUser, currentFarm } = useAuth();
  const token = currentUser?.sessionToken ?? "";
  const farmId = currentFarm?.id ?? "";

  const [rawNotifications, setRawNotifications] = useState<ERPNotification[]>([]);
  const [ephemeralReadIds, setEphemeralReadIds] = useState<Set<string>>(new Set());
  const [ephemeralDismissedIds, setEphemeralDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load local state for ephemeral notifications
  useEffect(() => {
    if (farmId) {
      setEphemeralReadIds(getLocalSet(localReadKey(farmId)));
      setEphemeralDismissedIds(getLocalSet(localDismissKey(farmId)));
    }
  }, [farmId]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/erp/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const data = await r.json();
      setRawNotifications(data.notifications ?? []);
    } catch { }
    finally {
      setLoading(false);
    }
  }, [token]);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark read
  const markRead = useCallback(
    async (id: string) => {
      const notif = rawNotifications.find((n) => n.id === id);
      if (notif?.persistent) {
        // Server-side mark read
        await fetch("/api/erp/notifications", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        setRawNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      } else {
        // Ephemeral — localStorage
        setEphemeralReadIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          saveLocalSet(localReadKey(farmId), next);
          return next;
        });
      }
    },
    [farmId, token, rawNotifications]
  );

  const markAllRead = useCallback(async () => {
    // Mark persistent ones on server
    const persistentIds = rawNotifications.filter((n) => n.persistent && !n.is_read).map((n) => n.id);
    for (const pid of persistentIds) {
      fetch("/api/erp/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: pid }),
      });
    }
    // Mark ephemeral ones locally
    setEphemeralReadIds((prev) => {
      const next = new Set([...prev, ...rawNotifications.filter((n) => !n.persistent).map((n) => n.id)]);
      saveLocalSet(localReadKey(farmId), next);
      return next;
    });
    setRawNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  }, [farmId, token, rawNotifications]);

  // Dismiss
  const dismiss = useCallback(
    async (id: string) => {
      const notif = rawNotifications.find((n) => n.id === id);
      if (notif?.persistent) {
        await fetch(`/api/erp/notifications?id=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setRawNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        setEphemeralDismissedIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          saveLocalSet(localDismissKey(farmId), next);
          return next;
        });
      }
    },
    [farmId, token, rawNotifications]
  );

  const dismissAll = useCallback(async () => {
    // Delete persistent ones
    fetch(`/api/erp/notifications?all=true`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // Dismiss ephemeral ones
    setEphemeralDismissedIds((prev) => {
      const next = new Set([...prev, ...rawNotifications.filter((n) => !n.persistent).map((n) => n.id)]);
      saveLocalSet(localDismissKey(farmId), next);
      return next;
    });
    setRawNotifications([]);
  }, [farmId, token, rawNotifications]);

  // Final processed list
  const notifications: ERPNotification[] = rawNotifications
    .filter((n) => {
      if (n.persistent) return true; // persistent ones already filtered by server
      return !ephemeralDismissedIds.has(n.id);
    })
    .map((n) => ({
      ...n,
      is_read: n.persistent ? n.is_read : ephemeralReadIds.has(n.id),
      read: n.persistent ? n.is_read : ephemeralReadIds.has(n.id), // backward compat
    }));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    dismiss,
    dismissAll,
    refresh: fetchNotifications,
  };
}
