import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useNotifications } from "../../src/hooks/useNotifications";
import { useLanguage } from "../../src/context/LanguageContext";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { t } = useLanguage();

  const handleNotifPress = async (item: any) => {
    if (!item.is_read) {
      await markAsRead(item.id);
    }

    if (item.reference_type === "Barang" && item.reference_id) {
      router.push(`/(tabs)/index?id=${item.reference_id}`);
    } else if (item.reference_type === "BarangMasuk") {
      router.push("/(tabs)/masuk");
    } else if (item.reference_type === "BarangKeluar") {
      router.push("/(tabs)/keluar");
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "danger":
        return "#fee2e2";
      case "warning":
        return "#fef9c3";
      case "success":
        return "#dcfce7";
      default:
        return "#dbeafe";
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);

    const tanggal = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const jam = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return { tanggal, jam };
  };

  const formatRelative = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t("notifikasi.baru_saja");
    if (diffMins < 60) return `${diffMins} ${t("notifikasi.menit_lalu")}`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t("notifikasi.jam_lalu")}`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ${t("notifikasi.hari_lalu")}`;

    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0d47a1" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="notifications" size={22} color="#0d47a1" />
          <Text style={styles.headerTitle}>{t("notifikasi.title")}</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>{t("notifikasi.mark_all")}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* LIST */}
      {notifications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons
            name="notifications-off-outline"
            size={64}
            color="#cbd5e1"
          />
          <Text style={styles.emptyText}>{t("notifikasi.empty")}</Text>
          <Text style={styles.emptySubtext}>{t("notifikasi.empty_desc")}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={["#0d47a1"]}
              tintColor="#0d47a1"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notifItem, !item.is_read && styles.notifUnread]}
              onPress={() => handleNotifPress(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.notifIcon,
                  { backgroundColor: getIconBg(item.type) },
                ]}
              >
                <Text style={styles.notifEmoji}>{item.icon || "🔔"}</Text>
              </View>

              <View style={styles.notifContent}>
                <Text style={styles.notifTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.notifMessage} numberOfLines={2}>
                  {item.message}
                </Text>

                {/* META WAKTU */}
                <View style={styles.notifMeta}>
                  <View style={styles.notifTimeRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={11}
                      color="#94a3b8"
                    />
                    <Text style={styles.notifDateTime}>
                      {formatDateTime(item.created_at).tanggal}
                    </Text>
                    <Ionicons
                      name="time-outline"
                      size={11}
                      color="#94a3b8"
                      style={{ marginLeft: 6 }}
                    />
                    <Text style={styles.notifDateTime}>
                      {formatDateTime(item.created_at).jam}
                    </Text>
                  </View>

                  <View style={styles.notifTimeRow}>
                    <Text style={styles.notifRelative}>
                      ({formatRelative(item.created_at)})
                    </Text>
                    <View style={styles.sourceBadge}>
                      <Ionicons
                        name={
                          item.source === "mobile"
                            ? "phone-portrait"
                            : item.source === "web"
                              ? "globe"
                              : "cog"
                        }
                        size={10}
                        color="#64748b"
                      />
                      <Text style={styles.sourceText}>{item.source}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#64748b" },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: { fontSize: 13, color: "#94a3b8", marginTop: 4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  headerBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  headerBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  markAllText: { color: "#0d47a1", fontSize: 12, fontWeight: "600" },
  listContent: { padding: 12, gap: 8 },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  notifUnread: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  notifEmoji: { fontSize: 20 },
  notifContent: { flex: 1 },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  notifMessage: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
    marginBottom: 6,
  },
  notifMeta: { marginTop: 4, gap: 4 },
  notifTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  notifDateTime: { fontSize: 10, color: "#64748b", fontWeight: "600" },
  notifRelative: {
    fontSize: 10,
    color: "#94a3b8",
    fontStyle: "italic",
    marginRight: 4,
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  sourceText: {
    fontSize: 9,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0d47a1",
    marginTop: 6,
  },
});
