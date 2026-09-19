import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "danger";
  category: string;
  icon: string | null;
  reference_id: number | null;
  reference_type: string | null;
  is_read: boolean;
  source: string;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const lastIdRef = useRef(0);

  /**
   * Fetch notif dari API
   */
  const fetchNotifications = useCallback(async (forceReload = false) => {
    try {
      const since = forceReload ? 0 : lastIdRef.current;
      const res = await api.get(
        `/notifications?platform=mobile&since=${since}`,
      );

      if (!res.data?.success) return;

      const list: NotificationItem[] = res.data.notifications || [];

      if (forceReload) {
        setNotifications(list);
      } else if (list.length > 0) {
        setNotifications((prev) => {
          const merged = [...list, ...prev];
          // Buang duplikat by id
          const unique = Array.from(
            new Map(merged.map((n) => [n.id, n])).values(),
          );
          return unique;
        });
      }

      setUnreadCount(res.data.unread_count || 0);

      // Update last id
      if (res.data.last_id && res.data.last_id > lastIdRef.current) {
        lastIdRef.current = res.data.last_id;
      }
    } catch (err) {
      console.log("Notif fetch error:", err);
    }
  }, []);

  /**
   * Refresh manual (pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  }, [fetchNotifications]);

  /**
   * Tandai 1 notif dibaca
   */
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.log("Mark read error:", err);
    }
  }, []);

  /**
   * Tandai semua dibaca
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post(`/notifications/read-all?platform=mobile`);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log("Mark all read error:", err);
    }
  }, []);

  /**
   * Pertama kali load + polling tiap 3 detik
   */
  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      await fetchNotifications(true);
      if (mounted) setLoading(false);
    })();

    const interval = setInterval(() => {
      if (mounted) fetchNotifications(false);
    }, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
