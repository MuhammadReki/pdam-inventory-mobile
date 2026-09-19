import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useNotifications } from "../hooks/useNotifications";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={() => router.push("/(tabs)/notifications")}
      activeOpacity={0.7}
    >
      <Ionicons name="notifications" size={22} color="#0d47a1" />

      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff", // ← Background PUTIH solid
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    // Shadow biar keliatan "ngambang" di atas header
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
});
